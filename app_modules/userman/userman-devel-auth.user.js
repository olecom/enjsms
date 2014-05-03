// ==UserScript==
// @name            development auto auth for supro
// @author          olecom
// @namespace       supro
// @description     supro userman app module auto auth; setup: localStorage['supro.user' || 'supro.role' || 'supro.pass']; defaults `olecom:developer.local:pass`
// @match           http://localhost:3007/
// @version         0.1
// ==/UserScript==

function closure(w, localStorage, con){
var username = localStorage['supro.user'] || 'olecom'
   ,userrole = localStorage['supro.role'] || 'developer.local'
   ,password = localStorage['supro.pass'] || 'pass'
   ,pref = '[supro devel] '

var loop, user

    loop = setInterval(
    function check_extjs(){
        if(!w.Ext) return
        if(!w.App) return
        if(!w.App.view) return
        if(!w.App.view.userman) return

        clearInterval(loop)

con.log(pref + 'auto auth start (to stop disable this userscript e.g. in `chrome://extensions/`)')

        user = Ext.ComponentQuery.query('field[name=user]')[0]
        if(!user) return

        if(user.emptyText != l10n.um.loginUserBlank){
con.log(pref + 'auto auth exit, session exists')
            return
        }

con.log(pref + 'auto auth user: ' + username)

        user.setValue(username)

        setTimeout(function wait_role_asking(){
        var role = Ext.ComponentQuery.query('field[name=role]')[0]
           ,pass = Ext.ComponentQuery.query('field[name=pass]')[0]
           ,auth = Ext.ComponentQuery.query('button[iconCls=ok]')[0]

            /*if(auth.disabled){
con.log('devel auto auth exit, session exists')
                return
            }*/

con.log(pref + 'auto auth set role && pass')
            role.setValue(userrole)
            pass.setValue(password)
            auth.getEl().dom.click()
        }, 1024)// localhost must be fast
    }, 2048)// wait for session check
}

/* run script from site's scope, not here in userscript's sandbox */

var script = document.createElement('script')

script.appendChild(
    document.createTextNode(
        '('+ closure.toString() + ')(window, localStorage, console)'
    )
)

document.head.appendChild(script)
