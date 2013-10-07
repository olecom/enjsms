/*====---- APP: self process management ----====*/
(function(require ,process ,log ,cerr ,eval ,setTimeout ,clearTimeout ,RegExp ,Math ,String) {
	var http = require('http'), net = require('net'), inspect = require('util').inspect
	,ctl_runs = null, app_runs = null, db_runs = null
	,err_log = [], gsm_inf = [], srv_log = [ 'Log start @[' + _date() + ']']

function _chklen(logs) {
//prevent memory hug, when web client is closed, thus doesn't read and clears log arrays
//full logs are on the file system anyway
	if (logs.length > 177)
		logs = logs.slice(87)
}
function _gsm(msg) { log (msg) ; _chklen(gsm_inf) ; gsm_inf.push(msg) }
function _log(msg) { log (msg) ; _chklen(srv_log) ; srv_log.push(msg) }
function _err(msg) { cerr(msg) ; _chklen(err_log) ; err_log.push(msg) }
function _date(){ //ISODateString
	function pad(n){return n<10 ? '0'+n : n}
	var d = new Date()
	return d.getUTCFullYear()+'-'
      + pad(d.getUTCMonth()+1)+'-'
      + pad(d.getUTCDate())+'T'
      + pad(d.getUTCHours())+':'
      + pad(d.getUTCMinutes())+':'
      + pad(d.getUTCSeconds())+'Z'
}
var str2hex = function(s) {
	return s.replace(/[\s\S]/g ,function(ch){
		return (ch < '\u0010' ? ' 0' : ' ') + ch.charCodeAt(0).toString(16)
	}).toUpperCase()
}

process.on('uncaughtException' ,function (err) {
	_err('fatal uncaught exception: ' + err + "\n" + err.stack)
})

/*====---- APP: telnet GSM part ----====*/

/* @inbuf		input buffer for full text lines from ME
   @gsmtel_runs	HW connection flag for TE2ME cmd loop start
   @TE_ME_mode  mid loop cmd chain sync (next cmd or give more data for same cmd)
   @ta			current terminal adapter (GSM engine)
*/

var	TE_ME_mode = 'login-mode' ,gsmtel_runs = null
	,ta ,ME = {}
	,inbuf = []

function get_input_lines(s) { //loop this fun() on data until there is full set of lines
	if(!ta) {
		_err('app error get_input_lines(): ta is null')
		return
	}
_gsm('data event got:"' + s + '"')
_gsm('data event got hex:"' + str2hex(s) + '"')
_gsm('ta._end_ch: ' + ta._end_ch.toString() + str2hex(ta._end_ch.toString()))
//join chuncks from the network and queue them in full lines
	inbuf.push(s) // add chunck to array
/* Commands are usually followed by a response that includes
   "<CR><LF><response><CR><LF>". (XT55 Siemens Mobile doc)
   this is case of "ATV1" setup
*/
	if (!ta._end_ch.test(s))
		return

	// full command in chunck: join all and return to cmd handler
	// remove repeated, front and tail new lines
	s = inbuf.join('')
		.replace(/\r+/g,'')
		.replace(/(^\n+)|(\n+$)/g,'')
		.replace(/\n+/g,'\n')
_gsm('s: "' + s.replace('\n', '|n') + '"')
	inbuf.splice(0) // clear
	return s ? s.split('\n') : null
}

/* GSM engines -,   ME (Mobile Equipment), MS (Mobile Station),
   are referred	|   TA (Terminal Adapter), DCE (Data Communication Equipment)
		   to as`:  or facsimile DCE (FAX modem, FAX board). (XT55 Siemens Mobile doc)*/

ME.GSM = function() {
// general GSM interface via Telnet of Terminal.exe by <braypp@gmail.com>
//== GSM command aliases: ==

/* 1.7.1 Communication between Customer Application and XT55 (Siemens Mobile doc)

Leaving hardware flow control unconsidered the Customer Application (TE) is coupled
with the XT55 (ME) via a receive and a transmit line.
Since both lines are driven by independent devices collisions may (and will) happen,
i.e. while the TE issues an AT command the XT55 starts sending an URC. This probably
will lead to the TEвЂ™s misinterpretation of the URC being part of the AT commandвЂ™s
response.
To avoid this conflict the following measures must be taken:
= If an AT command is finished (with "OK" or "ERROR") the TE shall always wait at
  least 100 milliseconds before sending the next one. This gives the XT55 the
  opportunity to transmit pending URCs and get necessary service.

  Note that some AT commands may require more delay after "OK" or "ERROR" response,
  refer to the following command specifications for details.

= The TE shall communicate with the XT55 using activated echo (ATE1), i.e. the XT55
  echoes characters received from the TE.

  Hence, when the TE receives the echo of the first character "A" of the AT command
  just sent by itself it has control over both the receive and the transmit paths.
  This way no URC can be issued by the XT55 in between.

i knew that!!!
*/
//modules. default set up
	this.modules = [ { modid:'единственный' ,ownum:null ,re:null ,cmdq: [] ,op: '??' ,sigq: 0} ]
	,this.modqlenTotal = 0
	,this.defmod = 1  // counts from one
	,this.curm = null // general setup to: ta.modules[ta.defmod - 1]
	,this._end_ch = /\n$/
	,this._cmdle = '\r\n'// usual command's ending
	,this.atsetup = 'ate1v1+CMEE=2' // _atok: /OK$/ || v0 -- _atok: /0$/
//data
	this.initcmds = function() {
		return [ this.atsetup ,this.info ,this.signal ,'at+COPS=3,0;+COPS?' ]
	}
	,this.info = 'ati'
	,this.signal = 'at+CSQ'
	,this.cfgOpName = 'at+COPS=3,0'
	,this.getOpName = 'at+COPS?'
//== private ==
	,this.__err = function(e) {
		_err('GSM error: ' + ta._cmd + (e ? e : ''))
		return ta._yes_next + '-err'
	}
	,this.__errfa = function(e) {
		_err('GSM error fatal: ' + e)
		gsmtel_runs == 'fatal error'
		ta.curm.cmdq.splice(0)
		if(ta._cmdTimeoutH) {
			clearTimeout(ta._cmdTimeoutH)
			ta._cmdTimeoutH = null
		}
		return 'reconnect-fatal-err'
	}
	,this.__nop = function(e) {}
//== const
	,this._yes_next = 'yes-next'
	,this._atok = /OK$/
	,this._ater = 'ERR'
//== var
	,this._err = function(e) {}
	,this._cmd = 'no command'
	,this._atdata = []
	,this._sync_ok = null
// std handlers
	,this._hsync = 'handle-sync'
	,this._handle = function(tamode, e) {}
	,this._async_handlers = []
	,this._appcb = null // ??? application's call back

	,this._timeoutLogin = 1024
	,this._timeoutAtSync = 1024
	,this._timeoutUSSD = 8192
//== public ==
	,this.login = function(e) {
_gsm("login: GSM via Terminal Telnet server")
		this._cmd = 'login'
//serial terminal program writes first line on telnet: "Terminal remote server"
		this._sync_ok = /^Terminal/
		this._err = this.__err
		this._handle = this.__handle
		return this._hsync
	}
	,this.get = function(e) {
_gsm("get: noop")
//empty command in this gsm interface, goto next cmd in que
		return this._yes_next
	}
	,this._in_releaseTimeout = null
	,this._cmd_releaseTimeout = 0
	,this.releaseH = this.__nop
	,this._USSDtimeoutH = null
	,this.do_release = function(){
_gsm('gsm do release')
		ta._handle = ta.__handle ; TE_ME_mode = null// std handler && its mode
		if(ta._appcb) ta._appcb = null// multimodule cmds can't clear this
		process.nextTick(_do_TELNET2MODULES_cmd_loop)
	}
	,this._cmd_get = 'get'
	,this._cmd_release = 'release'
	,this.release = function(e) {
//`release` gives back AT control on module,
// but any AT data is queued by module for next `get`
//`release` does not clear modules's cmdq
//TODO: only `get` or `AT` errors by timeout must clear cmdq
		ta._cmd = ta._cmd_release
		gsmtel_runs = ta._cmd
		if(ta._in_releaseTimeout){// pending `release` called directly
			clearTimeout(ta._in_releaseTimeout)
			ta._cmd_releaseTimeout = 0
			ta._in_releaseTimeout = null
		}
		if(ta._cmd_releaseTimeout > 0){
			ta._in_releaseTimeout = setTimeout(ta.do_release, ta._cmd_releaseTimeout)
		} else ta.do_release()
//returns nothing
	}
	,this.logout = function() {}
	,this._cmdTimeoutH = null
	,this._smsle = "\u001a" + this._cmdle
	,this.sms_mem_setup = 'smsmem'
	// `ate1` is needed; it is in `atsetup`
	// which also is in initcmds and any cmdq push
	,this._sms_mem_read = 'at+cmgf=1;+cpms?;+cmgl="ALL";+cpms?'
	,this.rcvd_sms = []//+CDSI: "SM",11 async event of sms delivery and sync +CMGL
	,this.smsmem = function(sock){// for curmod, read all SM, ME in db, remove all
_gsm('OK we in smsmem ta.curm.cmdq: ' + ta.curm.cmdq)
		ta._err = ta.__err
		gsmtel_runs = ta._cmd = ta._sms_mem_read
		ta._end_ch = /\n$/
		sock.write(ta._cmd+ta._cmdle)

		clearTimeout(ta._cmdTimeoutH)
		ta._cmdTimeoutH = setTimeout(ta.do_at_timeout, ta._timeoutAtSync)
/*ate1+cmgf=1;+cpms?;+cmgl="ALL";+cpms?

+CPMS: "SM",24,30,"SM",24,30,"SM",24,30

+CMGL: 0,"REC READ","+375297656850",,"08/12/01,10:16:24+08"
0414043E04310440043E04350020044304420440043E002100200421043E043B043D04350447043D
[вЂ¦]
+CMGL: 21,"REC READ",6,233,"+375298022483",145,"12/05/15,03:16:34+12","12/05/15,03:16:39+12",0
+CMGL: 23,"REC READ",6,252,"+375298022483",145,"12/05/24,08:29:48+12","12/05/24,08:29:54+12",0
+CMGL: 11,"REC UNREAD",6,229,"+375298022483",145,"12/05/15,03:00:37+12","12/05/15,03:00:42+12",0
+CMGL: 9,"REC READ",6,47,,,"12/05/23,04:29:55+12","12/05/23,04:30:02+12",0
//First Octet ^^^^^^^(id)
+CMGL: 3,"STO UNSENT","1111111",,
Hpmini5101-1499000
+CMGL: 11,"STO UNSENT","",,
OK

OK


+CPMS: "SM",24,30,"SM",24,30,"SM",24,30

OK
*/
		ta._handle = function(ta_lines_arr, samode){
			var i ,l ,m
			for (i in ta._async_handlers){
				ta._async_handlers[i](ta_lines_arr)
			}// possible async stuff
			ta.releaseH(ta_lines_arr)
			i = 0
			while(l = ta_lines_arr[i++]){
				if(/ERROR/.test(l)){
					return ta.do_at_timeout(' error: ' + l)
				}
				if(gsmtel_runs == ta._cmd){
					if(l == ta._cmd){// ate1+cmgf=1;+cpms?;+cmgl="ALL";+cpms?
						continue// head sync OK
					}
					m = l.match(/^[+]CPMS: "..",(\d+),/)
					if(m){// +CPMS: "SM",24,30,"SM",24,30,"SM",24,30
						m = parseInt(m[1])
						if (m > 0){
							gsmtel_runs = m// recs to read
_gsm('sms 2 read: ' + m)
							ta._sync_ok = l// cmd end sync
						} else {
							clearTimeout(ta._cmdTimeoutH)
							return ta._yes_next
						}
					}
				} else {// tail sync + read exactly m "shall be records": /^[+]CMGL: /
					if((ta._sync_ok == l) && (ta._yes_next == gsmtel_runs)){
						clearTimeout(ta._cmdTimeoutH)
			db_read_gsm_mem((ta.rcvd_sms.join('\n') + '\n').split('+CMGL'))
						ta.rcvd_sms.splice(0)
						return ta._yes_next// obviously it will be OK or timeout
					}
					ta.rcvd_sms.push(l)
					if(/^[+]CMGL: /.test(l)){// count a record
						if (0 == (--gsmtel_runs)){
							gsmtel_runs = ta._yes_next
						}
					}
				}
			}
			clearTimeout(ta._cmdTimeoutH)// +delta for reading step
			ta._cmdTimeoutH = setTimeout(ta._err, ta._timeoutAtSync)
			return ta._hsync// new gsmtel_runs => next step
		}//fun() _handle
		return ta._hsync// cmd is set
	}
	//mode=2 (buffer all)  SMS-DELIVER=1 BM=0 SMS-STATUS-REPORT=2 are stored in memory
	,this._sms_setup = 'at+cmgf=1;+cnmi=2,1,0,2,1'
	//echo off (echo of mgs itself is not needed)
	//49: (33:SMS Send + SMS-STATUS-REPORT request) + (16:time is present in relative format)
	//167 = 1 day = 24 hours sms validity period:> 12+(167-143)*30/60
	//0 = 0 (higher protocol)
	//8 = UCS2, 0 = GSM codepages
	,this._sms_smp_ucs2 = 'ate0;+csmp=49,167,0,8'
	,this._sms_smp_asci = 'ate0;+csmp=49,167,0,0'
	,this._timeoutSendSMS = 1024 << 2
	,this._smst = this._timeoutSendSMS
	,this.sms2send = []//+CMGS: 152     at cmd got sms id
	,this.do_smsTimeout = function(now){// serious error, clear cmdq, `release` module
		if(now && ta._cmdTimeoutH) clearTimeout(ta._cmdTimeoutH)
		ta._cmdTimeoutH = null
		_err('sms setup timout, schedule modules')
		if(!ta)
			return
		ta.curm.cmdq.splice(0)
_gsm('sms write ESC + at')
		gsmtel.write('\u001b' + ta._cmdle)//ESC will prevent possible hung in wating for sms text+\u001a
		//gsmtel.write('\u001b' + ta._cmdle)
		gsmtel.write('at' + ta._cmdle)//make device live after ESC (or it stucks)
		ta.release()// hard release
	}
	,this.sms = function(sock){
/* smscmds in cmdq: [ 'at+cmgf=1;+cnmi=2,1,0,2,1',
'sms',
'ate0+csmp=49,167,0,8;+CMGS="+375298022483"',
'04220435043A044104420020043D04300020003700300020043A043804400438043B043B0438044704350441043A04380445002004410438043C0432043E043B043E0432002C0020043F043E043C043504490430044E0449043804450441044F002004320020043E0434043D044300200053004D0053043A04430020043D043000200055004300530032002E',
'ate0+csmp=49,167,0,0;+CMGS="+375298022483"',
'Next part is pure ASCII and can be 140 charachters long. Word split charachters are dots spaces semicolons etc. This text has 210 symbols...' ]

NOTE: 'release' will end this cmdq
*/

		ta._cmd = ta.sms2send[0].atcmd
		gsmtel_runs = ta._cmd// setup timeout flag

		ta._cmdTimeoutH = setTimeout(ta.do_smsTimeout, ta._smst)
		ta._end_ch = /[ \n]$/
		ta._atdata_handler = null
		ta._sync_ok = /^>/
_gsm('sms: ' + ta._cmd)
		sock.write(ta._cmd+ta._cmdle)
		ta._handle = function(ta_lines_arr, samode){
			var m ,i
			for (i in ta._async_handlers) {//async handlers
				ta._async_handlers[i](ta_lines_arr)
			}
			ta.releaseH(ta_lines_arr)
_gsm('smsH gsmtel_runs, ta._cmd: ' + gsmtel_runs +' '+ ta._cmd)
/* Handling message send sequence:
atv0+cmgs="+375298022483"

> MSGBODY<SUB>
+CMGS: 52 | +CMS ERROR: 500
| possible async messages |
OK        |
*/
			if(gsmtel_runs == ta._cmd){
				if(/ERROR/.test(ta_lines_arr[0])){
					ta.sms2send[0].mid = ta_lines_arr[0]
					return ta.do_smsTimeout(true)
				}
				gsmtel_runs = ta._smsle
_gsm('smH sms write: ' + ta.sms2send[0].m)
				sock.write(ta.sms2send[0].m + ta._smsle)
				// fall thru
			}
			i = 0
_gsm('smH sms sync not err')
			do {
_gsm('smH i = ' + i + 'line: ' + ta_lines_arr[i] + 'ta._sync_ok: ' + ta._sync_ok)
				if(/ERROR/.test(ta_lines_arr[i])){
					ta.sms2send[0].mid = ta_lines_arr[i]
					return ta.do_smsTimeout(true)
				}
				m = ta_lines_arr[i].match(/^[+]CMGS:(.*)$/)
				if(m){// id of sms + time
					ta.sms2send[0].dateS = new Date()
					ta.sms2send[0].mid = parseInt(m[1])
				}
				m = null
_gsm('smH atok test i = ' + i + 'line: ' + ta_lines_arr[i])
				if(ta._atok.test(ta_lines_arr[i])){// sms sent, goto next sms
_gsm('sent sms: ' + inspect(ta.sms2send[0]))
					delete ta.sms2send[0].atcmd// no need in tech info in db
					ta.sms2send[0].module = ta.curm.ownum + ' ' + ta.curm.modid
					taout.save(ta.sms2send[0] ,function(e, rec){
						if(e) {
							_err('db err save sent sms: ' + e)
							return
						}
_gsm('db saved: ' + inspect(rec))
					})// async race with shift???
					ta.sms2send.shift()// next sms
					if(ta.sms2send.length > 0){
						ta._cmd = ta.sms2send[0].atcmd
						sock.write(ta._cmd + ta._cmdle)
						gsmtel_runs = ta._cmd
						return ta._hsync// next sms
					}
					clearTimeout(ta._cmdTimeoutH)
					ta._cmdTimeoutH = null
					return ta._yes_next// next cmd in cmdq -> `release`
				}
				//???if(gsmtel_runs == ta._ater) return ta.do_smsTimeout(true)
			} while (ta_lines_arr[++i])
_gsm('smsH sms sync end: ' + gsmtel_runs +' '+ ta._cmd)
			return ta._hsync// new gsmtel_runs => next step
		}//fun() handler
		return ta._hsync// cmd is set
	}
	,this.do_ussd_timeout = function(){
		if(ta._USSDtimeoutH){
			clearTimeout(ta._USSDtimeoutH)
			ta._USSDtimeoutH = null
		}
		if(ta) {
			if(ta._appcb) {
				ta._appcb('ussd timeout ' + ta._atdata.join('<br/>'))
				ta._appcb = null
			}
			ta.release()
		}
_gsm('ta.do_ussd_timeout, call release')
	}
	,this.do_at_timeout = function(e){
		clearTimeout(ta._cmdTimeoutH)
		ta._cmdTimeoutH = null
		if (gsmtel_runs == ta._cmd)
		return _err('timeout AT cmd: ' + ta._cmd + (e ? e : ''))
	}
	,this.at = function(sock, atcmd){ //'at'- sync, AT - async commands
		this._atdata_handler = null // sync atcmd --inside data--ok data handler
		this._err = this.__err // common error trap
		this._sync_ok = this._atok
		this._end_ch = /\n$/

		this._cmd = gsmtel_runs = atcmd
		if(ta._cmdTimeoutH) clearTimeout(ta._cmdTimeoutH)
		ta._cmdTimeoutH = setTimeout(this.do_at_timeout, ta._timeoutAtSync)

		if (atcmd == this.atsetup) {
/* first `at` command and first(or after get) setup of modem communication:
  'ate1v1+CMEE=2' (@this.atsetup)
   1) e1: echo on for head and tail sync
   2) v1: verbose cmd run codes e.g. '^OK$'
   3) +CMEE=2: error descriptions instead of codes */

			this._handle = this.__handle //simple handler until full `at` sync
// setup of `at` cmd sync. this command may or may not receive its echo
// thus handling must wait usual @_atok reply
			this._err = this.__nop
_gsm('at write setup: `' + atcmd + '` _timeoutAtSync: ' + ta._timeoutAtSync)
/* The "AT" or "at" prefix must be set at the beginning of each command line.
   To terminate a command line enter <CR>. (XT55 Siemens Mobile doc)
   <CR><LF> is used here:
*/
			sock.write(atcmd + ta._cmdle)
			if(0 == this._async_handlers.length) this._async_handlers.push(
				 this.SRVSTh
				,this.CSQh
				,this.CUSDh
				,this.CUSDht
			) //set up all async handlers
			return this._hsync
		} else if (this._handle !== this.__athandle){
// head and tail sync of any `at` command
			this._handle = this.__athandle
		}

/* 1) async AT commands with same prefix
   NOTE: upper case AT. This command issues 'OK',
         ta transmit, async ta recv, then ta reply with same prefix as cmd itself(+CUSD):
,---- USSD request --
|AT+CUSD=1,"*100#",15
|
|OK
.... some time delta
|+CUSD: 0,"Balans=3394r (OP=9777 do 09.05 23:19) Ostatok: MB=43.6 min=232",15
`----
   2) aync AT command's preliminary results with same prefix(+CMGS),
      final via other command (+CDSI)
,---- SMS sending --
|at+cmgs="+375298077782"
|hi, olecom.[ctrl+x]
# с русской кодировкой херь нужно разбираться
# ушла SMS, id=152
|+CMGS: 152
|OK
|
# SMS-STATUS-REPORT получен в память SM позицию 11
# (настройки могут быть разные куда писать)
|+CDSI: "SM",11
|
|+CMS ERROR: 305
# выбираем какую память читать
|at+cpms="SM"
|OK
|+CPMS: 19,30,19,30,19,30
|
# читаем позицию 11
|at+cmgr=11
# мессага id=152 доставлена (фотмат этой хери может быть разный)
|+CMGR: "REC UNREAD",6,152,"+375298022483",145,"12/03/22,02:42:12+12","12/03/22,02:42:17+12",0
#второй раз уже пишет, что прочитано
|at+cmgr=11
|+CMGR: "REC READ",6,152,"+375298022483",145,"12/03/22,02:42:12+12","12/03/22,02:42:17+12",0
`----
ATV[10]:
OK		 	0 Command executed, no errors
CONNECT		1 Link established
RING 		2 Ring detected
NO CARRIER 	3 Link not established or disconnected
ERROR 		4 Invalid command or command line too long
NO DIALTONE 6 No dial tone, dialling impossible, wrong mode
BUSY 		7 Remote station busy

at+cmgr=1

+CMS ERROR: 321
AT+CEER

+CEER: No cause information available

OK
320 Memory failure
321 Invalid memory index
322 Memory full
*/
		if(/^AT[+]CUSD=1/.test(atcmd)) {
			ta._in_ussd = null
			ta._USSDtimeoutH = setTimeout(ta.do_ussd_timeout, ta._timeoutUSSD)
_gsm('set ussd timeout ' + ta._timeoutUSSD)
			ta._cmd_releaseTimeout = 777 + ta._timeoutUSSD// delay `release`
			ta._end_ch = /[\n ]$/
		} else if(/^AT[+]CMGS/.test(atcmd)) {// non sync testing version
			ta._end_ch = /[ \n]$/ // normal or error(by timeout) case
			ta._sync_ok = /> /
			ta._cmd_releaseTimeout = 4444
		} else switch (atcmd) {
		case 'ati': /* data inside cmd - ok block */
			this._handle = function(ta_lines_arr) {
				for (var i in ta_lines_arr) {
					if (this._sync_ok.test(ta_lines_arr[i])) {
						app.gsm = 'GSM:&nbsp;' + this._atdata.splice(1).join('<br/>')
						this._atdata.splice(0)
						this._handle = this.__handle
						gsmtel_runs = this._atok
						clearTimeout(ta._cmdTimeoutH)
						ta._cmdTimeoutH = null
						return this._yes_next
					} else this._atdata.push(ta_lines_arr[i])
				}
_gsm('ati handler awaits @_sync_ok')
				return 'ati-loop'+this._hsync
			}
        break
		case this.getOpName:
			this._atdata_handler = this.COPSh
		break
		case this.CSQ:
			this._atdata_handler = this.CSQh
		break
		}
_gsm('at write: `' + atcmd + '`')
		sock.write(atcmd + ta._cmdle)
		return this._hsync
	}
/*  Handlers
	NOTE: async handler must look up all atdata[] for its match
*/
	,this.SRVSTh = function(atdata) {
		for(var i in atdata) {
			if (/SRVST:2/.test(atdata[i])) {//async: ^SRVST:2
				app.op = '??? '
				ta.curm.cmdq.unshift(ta.getOpName)
				ta.curm.cmdq.unshift(ta.atsetup)
			}
		}
	}
	,this.COPSh = function(atdata) {
		for(var i in atdata) {
			if (/COPS:/.test(atdata[i])) {// async: +COPS: 0,0,"MTS.BY",2
				ta.curm.op = atdata[i].replace(/(^[^"]+")|("[^"]*$)/g,'')
				if(gsmtel_runs == ta.getOpName && ta._cmdTimeoutH) {
					clearTimeout(ta._cmdTimeoutH)
					ta._cmdTimeoutH = null
				}
				break
			}
		}
	}
	,this.CSQ = 'at+CSQ'
	,this.CSQh = function(atdata) {
		var d
		if (this.CSQ == atdata[0]) {// sync: '+CSQ: 20,99'
			d = atdata[1]
			gsmtel_runs = this._atok
			clearTimeout(ta._cmdTimeoutH)
			ta._cmdTimeoutH = null
		} else for(var i in atdata) {
			if (/RSSI:/.test(atdata[i])) {// async: '^RSSI:25'
				d = atdata[i]
				break
			}
		}
		if (d)
			ta.curm.sigq = d.replace(/[^:]*:([^,]+).*/,'$1') +'/31'
	}
	,this._in_ussd = null
	,this.CUSDht = function(atdata) {// ussd multiline tail async
		if(ta._in_ussd) for(var i in atdata) {
			ta._atdata.push(atdata[i])// push multiline data
			//full reply or ussd error responses
			if (/",[^,]*$/.test(atdata[i]) ||
				/^[+]CUSD: .$/.test(atdata[i])) {// async RE: str start
_gsm('USSD tail: ' + atdata[i] + ' ta._in_ussd: ' + ta._in_ussd)
				if(ta._appcb) {
					ta._appcb(ta._atdata.join('<br/>'))
					ta._appcb = null
					ta._atdata.splice(0)
				}
				if('cancel' == 	ta._in_ussd) {
					gsmtel.write('\u001b')// bad useing global var, but
					gsmtel.write('AT+CUSD=2')// don't care of result
				}
				ta._in_ussd = null
				ta.do_ussd_timeout()
				return
			}// read all multiline ussd reply
		}
	}
	,this.CUSDh = function(atdata) {// ussd head async
/*
0 no further user action required (network initiated USSD-Notify,
  or no further information needed after mobile initiated operation)
1 further user action required (network initiated USSD-Request, or
  further information needed after mobile initiated operation)
2 USSD terminated by network
3 other local client has responded
4 operation not supported
5 network time out */
//??? не понимаю почему здесь не сработал `this`??? нужна привязка к глобальному `ta`
// так как я не знаю контекста этого `this`, лучше использовать глобальные переменные и не мучиться
		for(var i in atdata) { // async: '+CUSD: 0,"Vash balans sostavlyaet minus 3511 rublej...
			if (/^[+]CUSD: [012345]/.test(atdata[i])) {
_gsm('USSD head: ' + atdata[i])

				if (/^[+]CUSD: 0/.test(atdata[i])) {
					ta._in_ussd = 't'
				// cancel USSD continuation (portals spam, errors etc.)
				} else ta._in_ussd = 'cancel'

				ta._end_ch = /\n$/
				break
			}
		}
	}
	,this.__athandle = function(ta_lines_arr, samode) {
/* when modem's `echo` is on, then all `at` command's ME data starts from command itself
   this is the first sync point, tail must be ended with _atok, final sync point
   if first fails, then something happened with connection or getting of a voip module
   if second fails, this can be some fatal connection problems

-- i knew that, see "1.7.1 Communication between Customer Application and XT55"
*/
_gsm('at handler mode: ' + samode + ' arr: ' +ta_lines_arr)
		if (/sync$/.test(samode)) {
			var i = 0
			if (/handle-sync$/.test(samode)) while (true) {
				if (ta_lines_arr[i] == this._cmd) {
_gsm("got head of sync cmd: " + this._cmd)
					gsmtel_runs = this._atok
					clearTimeout(ta._cmdTimeoutH)
					ta._cmdTimeoutH = null
					break
				}
				if(++i >= ta_lines_arr.length)
					return 'AT-sync'
			} // looking 4 head

			while (true) {
				if (ta_lines_arr[i].match(this._sync_ok)) {
_gsm("got tail sync cmd: " + this._cmd)
_gsm("atdata: " + this._atdata.join('<br/>'))
					if(this._atdata_handler) /* data inside atcmd - ok block */
						this._atdata_handler(this._atdata)
					this._atdata.splice(0)
//AT handles async the same way as this._handle = this.__handle
					return this._yes_next
				} else this._atdata.push(ta_lines_arr[i])
				if(/ERROR/.test(ta_lines_arr[i])){
					_err('AT err cmd: ' + this._cmd + ', msg: ' + ta_lines_arr[i])
					break
				}
				if(++i >= ta_lines_arr.length){
					ta.releaseH(ta_lines_arr)
					return 'AT-sync'// sync -- no other command setup, but skip async spam
				}
			} // searching 4 tail
//_err("gsmtel __athandle(): !!! MUST NOT BE HERE1 !!!" + this._cmd)
			return this._yes_next
		} else { // the same way as this._handle = this.__handle
			for (var i in this._async_handlers) {
				this._async_handlers[i](ta_lines_arr)
			}
			ta.releaseH(ta_lines_arr)
			return 'yes-next-AT-asyn'
		}
	}
	,this.__handle = function(ta_lines_arr, samode) {
/* simple sync and async handler
   sync commands are done, when any line from ta match RE(@this.sync_ok)
   async handlers are called otherwise */
_gsm('handler ME mode: ' + samode + '\nthis._sync_ok:' + this._sync_ok + '\nthis._cmd:' + this._cmd)
		if (/sync$/.test(samode) && this._sync_ok) {
			var sync = this._sync_ok
			for (var i in ta_lines_arr) {
_gsm('ta_lines_arr[i]: ' + ta_lines_arr[i])
				if (ta_lines_arr[i].match(sync)) {
					_gsm("handled sync cmd: " + this._cmd)
					/*if(ta._appcb) {// universal handler does such call back
						process.nextTick(ta._appcb)
						ta._appcb = null
					}*/
					return this._yes_next
				}
			}
// no match, and since this is sync cmd, then error
// _err() must return either next cmd or do something to actually get cmd done
// clear sync flag to deal with possible async garbage between successive commands
			ta.releaseH(ta_lines_arr)
			return this._err(ta_lines_arr ? ta_lines_arr.join('') : 'no-event-data')
		} else {
//there can be any async garbage between successive commands
			for (var i in this._async_handlers) {
				this._async_handlers[i](ta_lines_arr)
			}
			ta.releaseH(ta_lines_arr)
			return 'yes-next-asyn'
		}
	}
	,this.qcmds = function (append_this_cmds, modid) {
	/*if (!(cmd_queue instanceof Array)) {
		_err('gsmtel queue_cmds(cmds, queue): @queue must be an array')
		return
	}*/
	var mcmdq
	if (modid) for (var i in ta.modules) {
		if(ta.modules[i].modid == modid){
			mcmdq = ta.modules[i].cmdq
			break
		}
	}
	if (!mcmdq) {
		mcmdq = ta.modules[ta.defmod - 1].cmdq
		modid = ta.modules[ta.defmod - 1].modid
	}
	if (append_this_cmds instanceof Array) {
		if (append_this_cmds.length <= 0)
			return
		mcmdq.push(ta._cmd_get)
		mcmdq.push(ta.atsetup)
		for (var i in append_this_cmds) {
			if (append_this_cmds[i]) {
				if ('string' === typeof append_this_cmds[i]) {
					mcmdq.push(append_this_cmds[i])
				} else {
					_err('qcmds(arg): @arg['+i+'] is null, must be string')
				}
			}
		}
//creating common release timeout, like it was: if(!/CUSD/.test(append_this_cmds)){
		mcmdq.push(ta._cmd_release)
	} else {
_err("append_this_cmds: " + append_this_cmds)
		if ('string' === typeof append_this_cmds) {
			if (append_this_cmds.length > 0) {
				mcmdq.push(ta._cmd_get)
				mcmdq.push(ta.atsetup)
					mcmdq.push(append_this_cmds)
				mcmdq.push(ta._cmd_release)
			}
		} else {
			_err('qcmds(arg): @arg is not string or array!')
		}
	}
_gsm('mcmdq in "'+modid+'": '+JSON.stringify(mcmdq))
}// qcmds
}// ME.GSM

//NOTE: function() objects aren't simple {}, ME['GSM']._dscr is undefined via fun() {this._dscr}
//      RegExp(undefined) matches everything /*if (!/^GSM$/.test(i)) */
ME.GSM._dscr =          "GSM modem via Telnet interface"
ME.E220      = { _dscr: "HUAWEI_E220" }
ME.MV37X     = { _dscr: "MV-374"
	,logout: function(){
		ta.write('logout'+ta._cmdle)
	}
	,login: function(sock, e) {
		const pass_sync = /word:.*$/
_gsm("MV37X login! : " + ta._sync_ok + ' ta._cmd: ' + ta._cmd)
	if('login' !== ta._cmd) { // init once
			ta._cmd = 'login'
//on telnet connect /^user/name and password is asked interactively (EOL != \n)
			ta._sync_ok = /^user/
			ta._end_ch = / $/ // space
			ta._err = this.__errfa
		}
		ta._handle = function(arg) {
		var r = ta.__handle(arg, 'sync')
_gsm("MV37X login handle r: " + r)
			if(/^yes/.test(r)) {
				if('/^user/' == ta._sync_ok) {
					ta._sync_ok = pass_sync
_gsm("MV37X sock write: voip")
					sock.write('voip'+ta._cmdle)
				} else if (pass_sync == ta._sync_ok){
					sock.write('1234'+ta._cmdle)
_gsm("MV37X sock write: 1234")
					ta._sync_ok = /\]$/
					ta._end_ch = ta._sync_ok
					ta._handle = ta.__handle // all chain handeled, goto next command
					ta._err = ta.__nop // eat stuff in std handler
					return ta._hsync // set next (std) handler's arg
				} else { /* collect or handle mid data here */ }
			} /* returns nothing, 'cos this handler doesn't care about @arg */
		}//fun
		return ta._hsync
	}
	,get: function(sock) {
_gsm('MV37X get cmd param write: `' + ta.curm.modid + '`')
		if(ta._cmd_releaseTimeout > 0){
			_gsm('MV37X release is pending')
			return
		}
		sock.write(ta.curm.modid + ta._cmdle)
		ta._cmd = ta.curm.modid
		gsmtel_runs = ta._cmd
//MV37X on get writes 'got!! press ctrl+x to release module X.'
		ta._sync_ok = /^got/
		ta._end_ch = /[\]\n]$/
		ta._handle = function(ta_lines_arr){
			var i = 0
_gsm('`get` handle data')
			do {
				if(/bad command/.test(ta_lines_arr[i])){
_err("telnet err bad cmd")
					ta.curm.cmdq.splice(0)
					return ta._yes_next// empty cmdq will schedule modules
				}
				while(gsmtel_runs == ta._cmd){
					if (ta_lines_arr[i] == gsmtel_runs){
_gsm('`get` head: ' + ta.curm.modid)
						gsmtel_runs = ta._end_ch
						clearTimeout(ta._cmdTimeoutH)
						ta._cmdTimeoutH = setTimeout(function(){
							ta._cmdTimeoutH = null
							if(gsmtel_runs == ta._sync_ok){
								//release current, schedule modules
								ta.curm.cmdq.splice(0)
								process.nextTick(_do_TELNET2MODULES_cmd_loop)
_gsm('timeout cannot get: ' + ta.curm.modid)
							}
						}, ta._timeoutGet)
					}
					break
				}
				while(gsmtel_runs == ta._end_ch){
					if (ta_lines_arr[i].match(ta._sync_ok)){
_gsm("got sync ok telnet cmd: " + ta._cmd)
						clearTimeout(ta._cmdTimeoutH)
						gsmtel_runs = ta._sync_ok
						return ta._yes_next
					}
					break
				}
			} while (ta_lines_arr[++i])
		}
		ta._cmdTimeoutH = setTimeout(function(){
			if(gsmtel_runs == ta._cmd){
				//release current, schedule modules
				ta.curm.cmdq.splice(0)
				process.nextTick(_do_TELNET2MODULES_cmd_loop)
				_err('timeout, clear cmdq, cannot get: ' + ta.curm.modid)
			}
			ta._cmdTimeoutH = null
		}, ta._timeoutGet)
		return ta._hsync// wait this cmd
	}
	,releaseH: function(ta_lines_arr){// sync or async handler
		//if(gsmtel_runs == ta._cmd_release)
		for(var i in ta_lines_arr){
			if (/^release/.test(ta_lines_arr[i])) {
_gsm('releaseH: ' + ta.curm.modid)
				gsmtel_runs = ta._cmd_release
				//ta.curm.cmdq.splice(0)
			}
			if(ta._end_ch.test(ta_lines_arr[i]) &&
			   gsmtel_runs == ta._cmd_release)
				process.nextTick(_do_TELNET2MODULES_cmd_loop)
		}
	}
	,do_release: function(){
		if(!ta || !gsmtel_runs)
			return// this fully async event may get such case
		gsmtel.write('\u0018')
_gsm("MV37X release. send CTRL+X CAN 0x18, after: " + ta._cmd_releaseTimeout)
		ta._sync_ok = /^release/ // switch std sync handler to MV37X's telnet cmds
		ta._end_ch = /\]$/ // restore telnet from ATs
		ta._err = ta.__nop
		ta._handle = ta.releaseH
		if(ta._appcb) ta._appcb = null
		ta._cmd_releaseTimeout = 0// allow schedule modules
		//process.nextTick(_do_TELNET2MODULES_cmd_loop)
	}
}

var modring = 0

function _do_TELNET2MODULES_cmd_loop() {
/* Modules manager
   On Telnet connect MODEL setup is done.
   Current module is set to default one or first otherwise.
   In its cmd queue's head `login` command is inserted and
   do_TE2ME handler is called.
   It events until cmdq is empty, thus nextTicking this manager.
*/
	if(!gsmtel_runs || !ta) {
		_gsm('telnet2modules: NOLINK')
		return
	}

	if(0 == modring){// first run
		if(ta.modules.length <= 0) {
			_err('app err: ta.modules[] is empty')
			return
		}
		modring = ta.defmod
	}

	if(ta._cmd_releaseTimeout > 0){// `release` is pending, reschedule
		process.nextTick(_do_TELNET2MODULES_cmd_loop)
		return
	}

	ta.modqlenTotal = 0
	for (var i in ta.modules)
		ta.modqlenTotal += ta.modules[i].cmdq.length
_gsm('sch: ta.modqlenTotal: ' + ta.modqlenTotal)

	if(ta.modqlenTotal <= 0)
		return// nothing to do, wait app commands

_gsm('sch: modring: ' + modring + " cmdq: "+ ta.modules[modring - 1].cmdq)
	var cm = modring

	while (ta.modules[modring - 1].cmdq.length <= 0){
		if(++modring > ta.modules.length)
			modring = 1
_gsm('sch: modring2: ' + modring)
		/*if (cm == modring){
			return //ring is over, but there are total commands
		}*/
	}
_gsm('sch: selected modring = ' + modring)
	ta.curm = ta.modules[modring - 1]
_gsm('sch: selecting "' + ta.curm.modid + '"')

// give currently selected module into evented data handling
	TE_ME_mode = ta._yes_next
	process.nextTick(_do_TE2ME_cmd_loop)
}

function _do_TE2ME_cmd_loop(ta_lines_arr) {
/* Main command and data handling
@ta_lines_arr: if defined, then data event has been accured,
               and there are some data lines to sent to sync or async handlers

@ta_lines_arr: undefined, set up the first command from the @ta.curm.cmdq queue

@gsmtel_runs: if null, then nothing happens (@ta.curm.cmdq can be cleared,
              because link is down and new set up chain of command will be needed
              and queued on connect)
*/
	if(!gsmtel_runs) {
//TODO: check if user closes all manually `connect` && `disconnect` commands
		//ta.curm.cmdq.splice(0) // clear cmds
// last cmd in queue must receive error
// not last, but currently set up handler must get show stop event
		_gsm('telnet: NOLINK')
		return
	}
	var next_cmd

_gsm('do loop, TE_ME_mode: ' + TE_ME_mode)
	if (ta_lines_arr) {
_gsm('cmd handle: ' + (ta_lines_arr.join('|')))
		next_cmd = ta._handle(ta_lines_arr, TE_ME_mode)
		if(!next_cmd) {// handler without yes_next, wait for more data
_gsm('no next more data')
			return
		}
	} else next_cmd = TE_ME_mode// first setup

	_gsm('handler ret || cmd to setup: ' + next_cmd)
	while (RegExp(ta._yes_next).test(next_cmd)) {
		var c = ta.curm.cmdq[0]
_gsm('cmd to setup: ' + c)
		if (!c) {
			ta._cmd = TE_ME_mode = ta._yes_next +" end of module's cmd queue"
//schedule modules
			process.nextTick(_do_TELNET2MODULES_cmd_loop)
			return //end cmd queue
		} else if(/^at/i.test(c)) {
//AT: specially handeled subset of commands
			next_cmd = ta.at(gsmtel, c)
		} else if(ta.hasOwnProperty(c)) {
			next_cmd = ta[c](gsmtel)
		} else {
_gsm('direct write of:' + c)
			gsmtel.write(c)
			//loop next cmd
		}
		ta.curm.cmdq.shift()
		//loop next cmd
	}
	TE_ME_mode = next_cmd // sets up new mode in handlers
}

var gsmtel_addr = { //GSM_TELNET="localhost:8023"
		 port: process.env.GSM_TELNET.replace(/[^:]*:/,'')
		,fqdn: process.env.GSM_TELNET.replace(/:[^:]*/,'')
	}
	,gsmtel

function gsmtel_init() {
	modring = 0
	gsmtel_runs = null
	TE_ME_mode = 'login-mode'
	app.gsm = 'connecting....' //reloads modules store in extjs
}

function gsmtel_configure() {
	var model = process.env.GSM_MODEL, i, j
//v0:,"_atok": /^0$/
//NOTE: JSON.parse() doen't do REs, so it must be implemented in conf load
	ta = new ME.GSM
	if (/^{/.test(model)) {
/*GSM_MODEL='{ "name": "MV001: MV-374 / MV-378 VoIP GSM Gateway"
,"module1": { "own":"+375298714075", "numre": "+37529[2578] +37533" }
,"module2": { "own":"set me in cfg", "numre": "+37529[136]  +37544" }
,"default": 1
,"_other_cfg": "be-be"
}'*/
	try {
		var cfg = JSON.parse(model)

		for(i in ME) {
			if(RegExp(ME[i]._dscr).test(cfg.name)) {
				var m = ME[i]
				for(j in m) {
					ta[j] = m[j]
				} // add own interface stuff to default
				break
			}
		}
		ta._dscr = cfg.name
		ta.modules.splice(0)// remove default
		j = 0
		for(i in cfg){
			if(!/(^default)|(^name)|(^_)/.test(i)) {
				var m
				if(cfg.default == ++j)
					ta.defmod = j //default module number in (array + 1)
				m = {} // new module object
				m.modid = i
				m.op = '??' // stats
				m.sigq = 0
				m.ownum = cfg[i].own
				m.re = []
				cfg[i].numre.replace(/[+]/g, '^[+]').split(' ').forEach(
	function(re_str){
		if(re_str)
			m.re.push(RegExp(re_str))
	}
				)
				m.cmdq = []
				ta.modules.push(m)
			} else if(/^_/.test(i))
				ta[i] = cfg[i] // possible other cfg stuff
		}
		if(!j) {
			_err('model JSON config err: no modules found')
		} else if(!ta.defmod) {
			_gsm('model module selection: "default" module number is out of range or is not defined, setting "module1"')
			ta.defmod = 1
		}
		if(ta._atsetup)
			ta.atsetup = ta._atsetup
		j = ta.initcmds()
		for (i in ta.modules)
			ta.qcmds(j ,ta.modules[i].modid)
	} catch(e) {
		_err('model JSON config err: ' + e + e.stack)
		_gsm('JSON cfg err, using default module config')
		ta = new ME.GSM
	}
	} else {
//simple GSM_MODEL='HUAWEI_E220 HSDPA USB modem'
		for(var i in ME) {
			if(RegExp(ME[i]._dscr).test(model)) {
				var m = ME[i]
				for(var j in m) {
					ta[j] = m[j]
				}// add own stuff to default
				break
			}
		}
		ta._dscr = model
		ta.qcmds(ta.initcmds())
	}
}

function gsmtel_ok(){
	if(!gsmtel_runs){
		_gsm('gsmtel_runs is null, wait and reconnect (4 sec) ...')
		gsmtel_runs = 'reconnect'
		_log('@[' + _date() + '] gsm telnet: reconnecting...')
/* NOTE:
gsmtel's socket timout must be less than this one
or `node` will say:
(node) warning: possible EventEmitter memory leak detected.
11 listeners added. Use emitter.setMaxListeners() to increase limit.
*/
		setTimeout(gsmtel_ok, 4096)
	} else if ('reconnect' == gsmtel_runs) {// no connection, try later
		gsmtel_runs = null
		gsmtel.connect(gsmtel_addr.port, gsmtel_addr.fqdn /*, no need in another callback*/)
	}
}

function gsmtel_setup(){
	gsmtel = net.connect(gsmtel_addr.port, gsmtel_addr.fqdn, gsmtel_ok)
	gsmtel.setTimeout(1024)//see NOTE in gsmtel_ok() above

	gsmtel_configure()// initcmds are in cmdq

	tain = ta._dscr.match(/^([^ :,.;]+)/)[1]
_gsm('db collection prefix: ' + tain)
	taout = db.collection(tain+'_taout')
	tain  = db.collection(tain+'_tain' )
	tain.stats(function(e, stats){
		if(stats.count <= 0){// if db income is empty, fill it from SIM
			for (var i in ta.modules)
				ta.qcmds(ta.sms_mem_setup ,ta.modules[i].modid)
			db_runs = 'init'
		}
	})

gsmtel.on('connect', function(){
	gsmtel.setEncoding('ascii')
//_gsm('ta: ' + inspect(ta))
	gsmtel_runs = '@[' + _date() + '] gsm telnet: connected to '
				+ gsmtel_addr.fqdn + ':'
				+ gsmtel_addr.port
	_log(gsmtel_runs)

/*`login` runs current module's cmd queue,
  empty cmdq schedules modules by calling _do_TELNET2MODULES_cmd_loop()

  otherwise this timeout will reboot gsmtel: */
	setTimeout(function(){
		if(gsmtel_runs && ta && 'login' == ta._cmd) {
			_err('\n'+
'==== FATAL ERROR: ====\n'+
'Telnet login fails. Maybe module config is wrong:\n"'+
process.env.GSM_MODEL+'"\n'+
'====')
			gsmtel.end()
		}
	}, ta._timeoutLogin)
	if(!ta.curm)// setup of current module
		 ta.curm = ta.modules[ta.defmod - 1]
	ta.curm.cmdq.unshift('login')// first module runs `login`

	TE_ME_mode = ta._yes_next

/* NOTE:
   this must be run as soon as possible to habdle any login prompts */
	process.nextTick(_do_TE2ME_cmd_loop)
})

// set up event handlers once
gsmtel.on('data', function(chBuffer){
	var lines = get_input_lines(chBuffer.toString())
_gsm('gsmtel `data` event lines:' + (lines ? lines.join('|'): 'null'))
	if (null == lines)
		return
	_do_TE2ME_cmd_loop(lines)
})

gsmtel.on('end', function(){
_gsm('gsmtel `end` event')
	// other end closed connection FIN packet
	gsmtel_init()
	//TODO: if !user
	setTimeout(gsmtel_ok, 4096)
})

gsmtel.on('error', function(e){
//NOTE: net error handler must not be inside init callback!!!
	if (e) {
		 _err('gsm telnet {addr:'+process.env.GSM_TELNET+'} err : ' + e)
		gsmtel_init()
		setTimeout(gsmtel_ok, 4096)
		return
	}
})
}
/*====---- APP: http web part ----====*/

var express = require('express')
    ,app = express() ,app_srv

app.configure(function(){
//    app.set('views', __dirname + '/views')
//    app.set('view engine', 'jade')
    app.use(express.bodyParser()) //parse JSON into objects
    app.use(express.methodOverride())
    app.use(app.router)
    //app.use('/extjs', express.static(__dirname + '/../../extjs-4.1.0-rc2'))
	//app.use('/extjs/examples/ux', express.static(__dirname + '/../../extjs-4.1.0-rc2/examples/ux'))
	//app.use('/extjs/ux', express.static(__dirname + '/../../extjs-4.1.0-rc2/examples/ux'))
    app.use('/extjs', express.static(__dirname + '/../../extjs-4.1'))
	app.use('/extjs/examples/ux', express.static(__dirname + '/../../extjs-4.1/ux'))
    app.use(express.static(__dirname + '/../_ui-web'))
	app.use(function errorHandler(err, req, res, next){
		if (err.status) res.statusCode = err.status;
		if (res.statusCode < 400) res.statusCode = 500;
		res.writeHead(res.statusCode, { 'Content-Type': 'text/plain' });
		res.end(err.stack);
	})
})
/*
app.configure('development', function(){
})
app.configure('production', function () {
})*/

// Routes
app.get('/', function (req, res) {
    res.redirect('/telsms.htm')
  }
)

app._htmlf = function(m, re) {
	return String(m).replace(/\n/g, '<br/>')
}
app_gsm = function(logmsg, atcmds_arr, cb, module) {
	if (logmsg)
		_gsm(logmsg)

	if(!gsmtel_runs) {
		return {
			success: !true
			,msg: 'telnet: NOLINK'
		}

	} else if ('reconnect' == gsmtel_runs) {
		return {
			success: !true
			,msg: 'telnet: reconnecting...'
		}
	} else if (!ta) {
		return {
			success: !true
			,msg: 'ME is undefined. Unexpected.'
		}
	}

	ta._appcb = cb
	ta.qcmds(atcmds_arr, module)

	process.nextTick(_do_TELNET2MODULES_cmd_loop) // post-event queuing is preferable here
}

/* Первый SMS через форму:
aT+cmgs="+375298022483"

>
test sms
^BOOT:10389262,0,0,0,6

+CMGS: 239

OK
 ExtJS SMS form load:
 smsNumber: +375298077782
 smsBody(str or array): text
 smsModule: module1 "+375297XXYY677"
*/

function mk_sms_body(smsText) { // based on to_ascii() from uglify-js by Mihai Bazon
    const smsA = 140, smsU = smsA / 2
    var a = true, aa = true, ws, c = 0, tc = 0, s = []

    smsText.replace(/[\s\S]/g, function(ch) {
        var co = ch.charCodeAt(0)

        a = a && (128 > co)
        ++tc
        ++c
        if (/[ .,\n\r:;!?]/.test(ch)) ws = c
        if(a) {
            if(smsA == c ) { s.push({ascii:a, count:c}) ; tc -= c ; c = 0 }
            if(aa) aa = !true
        } else {
            if (c > smsU && c <= smsA && !aa) {
                if (ws) { s.push({ascii:true, count:ws}) ; tc -= ws ; c -= ws ; ws = 0 }
                   else { s.push({ascii:true, count:c - 1}) ;  tc -= c - 1 ; c -= 1 }
                aa = true
                a = true
            }
            if(smsU == c) {
                /*if (ws) { s.push({ascii:a, count:ws}) ; tc -= ws ; c -= ws ; ws = 0 }
                   else { s.push({ascii:a, count:c}) ;  tc -= c ; c = 0 }*/
				s.push({ascii:a, count:c}) ;  tc -= c ; c = 0
                if(aa) aa = !true
                a = true
            }
        }
    })

    if(tc) {
        s.push({ascii:a, count:tc})
    }
	return s
}

function UCS2(text){// based on to_ascii() from uglify-js by Mihai Bazon
	return text.replace(/[\s\S]/g ,function(ch){
		ch = ch.charCodeAt(0)
		return (128 > ch ? "00" : "0") + ch.toString(16)
	}).toUpperCase()
}

function unUCS2(hext){
	return hext.replace(/..../g ,function(ch){
		return String.fromCharCode(parseInt(ch ,16))
	})
}

app_sms = function(smsnum, smsbody, cb, module) {
	if(!gsmtel_runs) {
	return { success: !true ,msg: 'gsm: NOLINK'}
	} else if ('reconnect' == gsmtel_runs) {
	return { success: !true ,msg: 'gsm: reconnecting...'}
	} else if (!ta) {
	return { success: !true ,msg: 'ME is undefined. Unexpected.'}
	}
	var i ,j ,k ,m
//normalize numbers: +375 29 8077782 +375 (29) 8077782 (29) 80-777-82 +37529234234
		,smsnums = smsnum.replace(/ +/g,' ')
				   .replace(/ *[(]/g,' +375') .replace(/ *[+]375 *([+]375)/g,' $1')
				   .replace(/(-)|([)] *)/g,'').replace(/ +(\d\d) +/g,'$1')
				   .split(' ')
//ascii and ucs2 body parts, ta._sms_smp
		,smsbods = mk_sms_body(smsbody)
_gsm("sms 2 " + smsnums)
_gsm('smsbods: ' + inspect(smsbods))

	ta._smst = ta._timeoutSendSMS
	for(i in smsnums) {
		if(!smsnums[i])
			_err((1+parseInt(i)) + 'й номер пуст.')
		else {
			k = 0
			for(j in smsbods) {
				m = { num: smsnums[i] ,dateQ: new Date() ,dateS: null ,mid: null ,module: null }
				if(smsbods[j].ascii) {
					m.atcmd   = ta._sms_smp_asci + ';+CMGS="'+smsnums[i]+'"'
					m.m = smsbody.substr(k, k + smsbods[j].count)
				} else {
					m.atcmd   = ta._sms_smp_ucs2 + ';+CMGS="'+smsnums[i]+'"'
					m.m = UCS2(smsbody.substr(k, k + smsbods[j].count))
				}
				ta.sms2send.push(m)
				k += smsbods[j].count
				ta._smst += ta._smst// sms times timeout
			}
		}
	}

	if(ta.sms2send.length > 0){
_gsm('sms2send: ' + inspect(ta.sms2send))
		ta.qcmds([ ta._sms_setup, 'sms' ], module)
		process.nextTick(_do_TELNET2MODULES_cmd_loop)
		return { success: true ,msg: 'SMS `AT` executed'}
	}
	return { success: !true ,msg: 'no SMS 2 send'}
}
//TODO: app.post('/qsms.json', function (req, res) {

app.post('/sms.json', function (req, res) {
	var ret
	if (!req.body.smsNumber) ret = {
		success: !true
		,msg: "form's smsNumber is null. Unexpected."
	};else ret = app_sms(req.body.smsNumber
		,req.body.smsBody
	,function(msg) {
		res.json({
			success: true
			,msg: msg
		})
	}
	,req.body.smsModule.replace(/ .*$/, ''))
	if (ret) res.json(ret)// error or other info which ends res here
  }
)

app.post('/ussd.json', function (req, res) {
//ExtJS USSD form load
	var ret
	if (!req.body.ussdNumber) ret = {
		success: !true
		,msg: "form's ussdNumber is null. Unexpected."
	};else ret = app_gsm('ussd: ' + req.body.ussdNumber
		,['AT+CUSD=1,"'+req.body.ussdNumber+'",15']
//ExtJS ussd form reply format: { "success": true, "msg": "A command was done" }
//http error reply is plain text (hacked connect's errorhandler middleware)
		,function(msg) {
			msg = msg.replace(/(^[^"]+")|("[^"]+$)/g,'')
			tain.save({ m: msg ,num: req.body.ussdNumber ,d: new Date() } ,function(e){
				if(e) _err('db ussd save err: ' + e)
			})
			res.json({
				success: true
				,msg: msg
			})
		}
		,req.body.module.replace(/ .*$/, '')
	)
	if (ret) res.json(ret) // error or other info which ends res here
  }
)

app.get('/gsmemr.json', function (req, res) {
//ExtJS table load: USSD and SMS from DB: start=80&limit=20
	db_runs = ''
	for (var i in ta.modules){
		ta.qcmds(ta.sms_mem_setup ,ta.modules[i].modid)
		db_runs += '>'
	}
	db_runs += 'E'
	process.nextTick(_do_TELNET2MODULES_cmd_loop)
	res.json({ success: true })
  }
)

app.get('/tain.json', function (req, res) {
//ExtJS table load: USSD and SMS from DB: start=80&limit=20
	var r = {}
	tain.find().sort({$natural: -1})
				.skip(parseInt(req.query.start))
				.limit(parseInt(req.query.limit), function(e, recin) {
		r.data = recin
		tain.stats(function(e, stats){
			r.total = stats.count
			res.json(r)
		})
	})
  }
)

app.get('/taout.json', function (req, res) {
//ExtJS table load: sent SMS
	var r = {}
	taout.find().sort({$natural: -1})
				.skip(parseInt(req.query.start))
				.limit(parseInt(req.query.limit), function(e, recout) {
		r.data = recout
		taout.stats(function(e, stats){
			r.total = stats.count
			res.json(r)
		})
	})
  }
)

app.get('/swhw_stat.json', function (req, res) {
//ExtJS will load this once in a while into Ext Store for dataview
	var i, logs = [], gsms = [], errs = []
	if (srv_log.length > 0) {
		for (i in srv_log) { logs.push(app._htmlf(srv_log[i])) }
		srv_log.splice(0)
	}
	if (gsm_inf.length > 0) {
		for (i in gsm_inf) { gsms.push(app._htmlf(gsm_inf[i])) }
		gsm_inf.splice(0)
	}
	if (err_log.length > 0) {
		for (i in err_log) { errs.push(app._htmlf(err_log[i])) }
		err_log.splice(0)
	}
	modules = []
	if (ta) for (i in ta.modules){
		modules.push({op: ta.modules[i].op, sigq: ta.modules[i].sigq })
	}
    res.json({
		stats: [
{ os: app.os
  ,server: app.server
  ,db: app.db
  ,uptime: Math.ceil(process.uptime())
  ,gsm: app.gsm
}
		]
		,modules: modules
		,logs: logs, gsms: gsms, errs: errs
	  }
	)
	if(app.gsm) app.gsm = null
  }
)

app.get('/mods.json', function (req, res) {
// serv static store of configured modules
	var m
	if (ta) {
		m = []
		for (var i in ta.modules) {
			m.push({d: ta.modules[i].modid+
				  (ta.modules[i].ownum ? ' "'+ta.modules[i].ownum+'"':'')})
		}
	} else m = [{d:'нет связи с движком GSM'}]
	res.json(m)
  }
)

/*
\  / Error handling for web app, http control channel.
 \/  All errors are fatal except -- EAGAIN && EINTR while reading something.
 /\  Latter must be handled by nodeJS. Thus we exit(1) if there is any.
 \/
 /\  External watchdog or user must take care about running this "forever".
/  \
 */

var ctl = http.createServer(function(req, res){
	var status = 200, len = 0, body = null
	if ('/cmd_exit' == req.url){
		process.nextTick(function(){
			process.exit(0)
		})
	} else if ('/sts_running' == req.url) {

	} else if ('/cmd_stat' == req.url) {
		if ('GET' == req.method) {
			body = Math.ceil(process.uptime()).toString()
			len = body.length
		}
	}
	res.writeHead(status, {
'Content-Length': len,
'Content-Type': 'text/plain' })
	res.end(body)
})

app_srv = http.Server(app)
app_srv.on('error', function(e){
	if (/EADDR.*/.test(e.code)){
_err("web app can't listen host:port='*':" + process.env.JSAPPCTLPORT +
			"\n" + e +
		    "\npossible 'app.conf' 'JSAPPCTLPORT' port collision or bad IP address")
	} else {
_err("web app: " + e)
		//state_machine_append(err)
	}
	if (!app_runs)
		process.exit(1)
  }
)

ctl.on('error', function(e){
//NOTE: net error handler must not be inside init callback!!!
	if (EADDRINUSE == e.code) { //'EADDRINUSE' 'EADDRNOTAVAIL'
_err("controlling channel can't listen host:port='127.0.0.1':" + process.env.JSAPPCTLPORT +
			"\n" + e +
		    "\npossible 'app.conf' 'JSAPPCTLPORT' port collision")
	} else {
_err("controlling channel: " + e)
	}
	if (!ctl_runs)
		process.exit(1)
  }
)

app_srv.on('listening', function(){
	app_runs = _date()
  }
)

ctl.on('listening', function(){
	ctl_runs = _date()
  }
)

app_srv.on('close', function(){
	app_runs = null
  }
)

ctl.on('close', function(){
	ctl_runs = null
  }
)

process.on('exit' ,function(){
	if(gsmtel) try {
		if(ta && ta.logout) ta.logout()
		gsmtel.end()
	} catch(e) {}
	log('telsms nodeJS exit.')
})

/*====---- APP: memory = data base ----====*/

function db_read_gsm_mem(arr){
/*
 == SMS-STATUS-REPORT ==:
15: ": 21,"REC READ",6,233,"+375298022483",145,"12/05/15,03:16:34+12","12/05/15,03:16:39+12",0"
smsas RE:      ^^^^^^^^+++^            das RE: ^++++++++++++++++++++^^^++++++++++++++++++++^
 == SMS-DELIVER ==:
14: ": 20,"REC READ","+375297253059",,"10/04/21,15:11:51+12"\n003700390033003100350031003904210430вЂ¦."
smsd RE:       ^^^^^^^+++++++++++++^  ^++++++++++++++++++++^^ = dad
*/
	var  smss = /READ",6,([^,]+),/
		,smsd = /READ","([^"]+)"/
		,gsmd = /(\d\d)[/](\d\d)[/](\d\d),(\d\d):(\d\d):(\d\d)/
		,das = /"([^"]+)","([^"]+)"/
		,dad = /"([^"]+)"\n([\s\S]+)\n$/
		,csms5 = /^050003/
		,csms6 = /^060804/
		,reports = []
		,ucs2body
		,m ,r ,i ,d

	arr.shift()// remove empty first `split`
_gsm('sms arr len: ' + arr.length)
	for(i in arr){// record header can be removed in UI
		r = { m: arr[i] }// default
		if(m = r.m.match(smsd)){
			r.num = m[1]
			if(m = r.m.match(dad)){
				d = m[1].match(gsmd)
				r.d = new Date('20'+d[1],parseInt(d[2])-1,d[3],d[4],d[5],d[6])
				d = m[2]
				if(csms5.test(d)){// multipart concatenated SMS
					d = 12        // skip header, decode body
				} else if(csms6.test(d)){
					d = 14
				} else d = 0
				d = m[2].substr(d)
				ucs2body = RegExp('^0[04][0-9A-F]{'+(d.length-2)+'}')
				if(ucs2body.test(d)){// match UCS2 at whole string length
					r.m = unUCS2(d)
				} else r.m = d
			}
		} else if(m = r.m.match(smss)){
			r.mid = parseInt(m[1] ,10)
			if(m = r.m.match(das)){
				d = m[1].match(gsmd)// poslan    Date()
				r.p = new Date('20'+d[1],parseInt(d[2])-1,d[3],d[4],d[5],d[6])
				d = m[2].match(gsmd)// dostavlen Date()
				r.d = new Date('20'+d[1],parseInt(d[2])-1,d[3],d[4],d[5],d[6])
				//if (status){// sms status reports and check of mid
				//no deletes
				reports.push(r)
				//}
			}
		}
		if(/^>/.test(db_runs))
			if (!/,"REC UNREAD",/.test(r.m))
				continue

		tain.save(r ,function(e){
			if(e) _err('db GSM save err: ' + e)
		})
	}
	tain.ensureIndex({mid: 1} ,{sparse: true})
	db_runs = db_runs.replace(/>/,'')// for every module
	if(reports.length > 0){
		for(i in reports){
		// arg is send by value, not by ref, thus update is safe in loop
			fix_mid_date_update(reports[i])
		}
	}
}

function fix_mid_date_update(d){
var dl ,dh = (15*60*1000)// 15 minutes
	// local send date +- possible delta with GSM time, can be in config
	dl = new Date(d.p.getTime() - dh)
	dh = new Date(d.p.getTime() + dh)
	taout.find({mid: d.mid, dateS: {$gt: dl ,$lt: dh }} ,function(e ,r){
		if(e) {
			_err('db.taout mid err: ' + e)
			return
		}
		if (r.length == 1){
_log('4updater found: ' + inspect(r))
			//real i.e. GSM send and receive time
			taout.update({ _id: r[0]._id }, {
				$set: { mid: -d.mid, dateS: d.p, dateR: d.d }
			})
		}
	})
}

// init
try { // third party modules better to try{}
	db_runs = false
	var mongo = require('mongojs'), db ,tain ,taout
} catch (e) {
	cerr("[error] mongojs init: " + e)
	process.exit(1)
}

function db_run_check(){
	if (!process.env.MONGODS) {
		_log("db: `process.env.MONGODS` is null, no db set")
		return
	}
// mongodb-native or mongojs needs to redo connection on error
	db = mongo.connect(process.env.MONGODS + '/test')
	db.admin(
function(aerr, a) {
	if(aerr){
		_err("db.admin(): " + aerr)
		setTimeout(db_run_check ,4096)
		return
	}
	a.command({buildInfo: 1}, function(e ,d) {
		if(e){
			setTimeout(db_run_check ,4096)
			_err('db.admin.command():' + e)
			return
		}
		app.db = "mongodb v" + d.documents[0]['version']
		_log("telsms DB server: " + app.db + "@" + process.env.MONGODS + "\n")
		db_runs = _date()
		app_srv.listen(process.env.JSAPPJOBPORT, function(){
			_log(
"telsms Express server is listening on port " + process.env.JSAPPJOBPORT +
" in " + app.settings.env + " mode\n"+
"controlling channel is http://127.0.0.1:" + process.env.JSAPPCTLPORT + "\n")
			app.os = process.platform + '@' + process.arch
			app.server = 'nodeJS v' + process.versions['node']
			//setting up link with gsm
			app.gsm = 'connecting....'
			gsmtel_setup()
		  }
		)
	  }
	)
}//cb admin
	)
}// once per app run, make init of global its parts
ctl.listen(process.env.JSAPPCTLPORT, '127.0.0.1', db_run_check)
})( require ,process ,console.log ,console.error ,eval
	,setTimeout ,clearTimeout ,RegExp ,Math ,String)
//olecom: telsms.js ends here
