l10n.um = { lang: 'en'// localization is used only in UI for ease of updates
   ,modname: "User management"
   ,tooltip: "User management, permissions, etc."
   ,user: "User"
   ,users: "Users"
   ,role: "Role/Position"
   ,pass: "Password"

   ,auth: "Accessing..."
   ,loginInfo:
'<b>Access requisits:</b><br/>user id, password<br/>' +
'role/position - if needed'
   ,loginUserBlank: 'user id'
   ,loginOk: 'Enter the system'
   ,loginCurrentSession: 'Continue session'
   ,logoutTitle: 'Session'
   ,logoutMsg: function(id){ return 'Current session of user <b>"' + id + '"</b> is closed' }

   ,l10n: 'Localization setup'
   ,l10nReset: 'Use default configured localization'

   ,roles:{
        'admin.local':  "Administrator with full access to the application"
       ,'admin.remote': "Administrator. User and access management"
       ,'developer.local': "Local Developer with full access to the application"
       ,'developer':    "Remote Developer without full access"

       ,boss:        "Boss, Chief"
       ,manager:     "Manager"
       ,warehouse:   "Warehouse worker"
       ,shop:        "Shop"
       ,accountant:  "Accountant"
   }
   ,can:{
        'App.view.desktop.BackendTools':'Main node.js process management (start/restart/stop)'
       ,'App.backend.JS':               'Running code inside main process (brain)'
   }
}
