l10n = { lang: 'en',
    app: 'SUPRO Demo'
    ,welcome: 'SUPRO welcomes: application development'
    ,reload: 'reload',

    loading: 'Loading...'
    ,errload: 'Loading failed due to errors.'
    ,errload_no_app:
        'Installation error! File not found: "app_front.js".\n' +
        'Check of configuration is needed.'
    ,errload_config_read:
        'Config file reading error!'
    ,errload_config_log_not_dir:
        'Error: fail to read log directory.\n' +
        'Config option:: '
    ,errload_config_log_mkdir: 'Error: fail to create log directory.'
    ,errload_spawn_backend: 'Error starting backend! Error code: '
    ,errload_check_backend: '\n' +
'Error! Backend of the system has started but there is no HTTP access to it!\n' +
'Possibly firewall or antivirus is blocking TCP/IP.\n\n' +
"Assistance is needed: system administrator's or developer's."
    ,tray:{
        title: 'SUPRO'
        ,winvis: 'SUPRO window is visible'
        ,wininv: 'SUPRO window is hidden'
    }

    ,via_proxy:function(url){ return ''+
'Server address for remote users goes via PROXY!' + '\n' +
'There may be problems connecting from the network.\nURL = ' + url
    }

    ,extjsNotFound:
        'Fail to load "ExtJS" (UI framework).\n' +
        'Check of application configuration is needed.'
    ,extjsPathNotFound: function(shortcut_config, config, j){
        var name_example = '\n\n'+
'Example of ExtJS 4.2.1 release directory name: "ext-4.2.1.883".'
           ,about_file = ''+
'File `' + shortcut_config + '` in app root directory, ' +
'either not found or has wrong directory name (ExtJS location).' +
name_example

        if(1 == j){
            return ''+
'Config option `config.extjs.path` = "' + config +
'" has not correct directory (ExtJS location).\n\n' +
about_file
        }
        if(2 == j){
            return ''+
'Empty `config.extjs.path` option.\n\n' +
about_file
        }
        return '' +
'Neither local file `' + shortcut_config +
'`,\nnor `config.extjs.path` = "' + config +
'"\npoints to ExtJS location.' +
name_example
    }
    ,uncaughtException: "Unexpected internal error! Developer's assistance is needed.\n"

    ,stsSystem: 'Backend (main) process connection. Info/Log.'
    ,stsHandleTipTitle: 'What happens inside of the system?'
    ,stsHandleTip: 'Double click on gears to open/close window'
    ,stsStart: 'START main `nodejs`'
    ,stsCheck: 'CHECK main `nodejs`'
    ,stsRestarting: '(2 sec.) starting new `nodejs`'
    ,stsKilling: 'KILL/TERMINATE `nodejs` (hangs)'
    ,stsBackendPid: function(pid){
        return '' + pid + ' - PID of the main nodejs process of the system'
    }
    ,stsBackendXHR: "connection to the main nodejs process"
    ,stsOK: 'OK'
    ,stsHE: 'FAIL'
    ,stsClean: 'Clear'
    ,stsEcho: 'Request-check'
    ,stsRestart: 'Restart'
    ,stsKill: 'Terminate/kill process (hangs)'
    ,stsKilled: 'main process is "killed"'
    ,stsKilledAlready: 'main process is already "dead"'
    ,stsAlive: 'main process is "alive"'
    ,stsDead: 'Ignore request. Restart is needed'
    ,stsMsg: 'Messages: '
    ,stsMarkRead: 'Mark all as read'

    ,time: 'Time'
    ,operation: 'Operation'
    ,description: 'Description'
    ,result: 'Result'

    ,shutdown: 'Exit or block'
    ,connection: 'Network connection state'
    ,userStatus: 'User status'
    ,userStatusMenu: 'User<br/>status list'
    ,userStatuses: { 'online': 'Online','away': 'Away','busy':'Busy','offline':'Offline' }

    ,um: null // user manager
}
