Ext.define('App.view.Bar',{
    extend: 'Ext.toolbar.Toolbar',
    xtype: 'app-bar'
   ,region: 'west'/*border*/, dock: 'left', layout: 'vbox'
   //,region: 'north'/*border*/, dock: 'top', layout: 'hbox'
   ,defaults:{ dock: 'left' }// = ^^^^

   ,baseCls: 'x-gray-toolbar'
   ,border: false
   ,initComponent: function bar_dynamic_init(){
    var me = this
        me.items = Ext.Array.push([
            {
            xtype:'splitbutton',
            text: '<img height=18 width=17 src="data:image/x-icon;base64,AAABAAEAEBAAAAAAAABoAwAAFgAAACgAAAAQAAAAIAAAAAEAGAAAAAAAAAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/lDo/lDo6izRPqkyFhYU9DQA9DQAAAAAAAAAsdiYobSEyfiwAAAAAAAAAAAA+kTlAlTtXu1U9kDc6gzSFhYU9DQA9DQA4ijI+kzkMNgFCADMbwhYAAAAAAAAAAAA/lDo/lDo1gi5CEAE9DQA9DQA9DQA9DQA9DQA9DQBCEAE4ijImniEgeBsqliY9kTc/kzo1gi5CEAE9DQAH+vIH+vI9DQAH+vIH+vIEz949DQAuCgA4ijJZg1EWmxM9kTc5eTJCEAE9DQAH+vJPEgEH+vI9DQAH+vIH+vIH+vI4DQE4DQGhoaExjiwWmxMycis9kTehoaE9DQAICAg9kTeFhYU9DQA9DQCHh4cH+vIH+vI9DQBCEAE1gi4yky1CnT49kTc9kTc9kTc9kTc9kTeFhYU9DQBHR0c5iTSHh4cH+vIFBQVCEAE1gi5AkDs9kTdFnT9ImkM4ijLU0s89DQA9DQA9DQA9DQCHh4cH+vIH+vI9DQChoaEthygulCo9kTc9kTc1gi5CEAE9DQAH+vIH+vIH+vIH+vIH+vIH+vIEz95CEAE4ijI2izEA1wA9kTcAAAChoaE9DQAEz94H+vKHh4c9DQA9DQA9DQA9DQBCEAE4ijI7kzYviyp6gnI9kTc1gi4uCgA9DQAH+vIFAQA1gi49DQA9DQA5iTQ/jDo8ijdXUU83bjE2ezA5iTQ9kTc1gi4uCgA9DQAH+vIFAQAAAAA9DQA9DQBCEAHU0s9CEAF9e3o1gi4AAAA9jzc9kTcAAAChoaE9DQBCEAEH+vKHh4c9DQBCEAEH+vIH+vIFBQVCEAGFhYUAAAAyfCw9kTc9kTcoeCFCEAE9DQAH+vIH+vI9DQBCEAEH+vIH+vIFBQU9DQA1gi4ANAAzfi0ANAA9kTcbaBNNnkpCEAE9DQA9DQA9DQA9DQA9DQA9DQBCEAE1gi40fy8+kzoxeysqdyMkcR0ANAAANAAANAA1gi4uCgA9DQA9DQA4ijI4ijIANAAANAAANAA+kTkAAAD8fwAA/H8AAPAPAADgBwAAwAMAAMQDAAD8QwAA8AMAAOAHAADADwAAwn8AAMIHAADAAwAA4AcAAPAPAAD8fwAA"/>',
            listeners:{
                'click': function(me){
                    me.menuVisible = me.menuVisible ? !me.hideMenu() : !!me.showMenu()
                }
            },
            menu: App.view.items_Shortcuts// app modules items
            }
           ,{ xtype: 'menuseparator' }, '-'
           ,{// window manager
                xtype:'toolbar'
               ,border: false
               ,enableOverflow: true
               ,items:[
                {
                    text: '<img height=16 width=16 src="css/favicon.png"/>'
                   ,enableToggle: true
                    //,toggleHandler: onItemToggle
                   ,pressed: true
                }
               ,{ text: '<img height=16 width=16 src="'+ (App.cfg.backend.url || '') + '/css/userman/userman_shortcut.png"/>' }
                ]
            }
            ]
            ,App.view.items_Bar// app modules items
        )

        me.callParent(arguments)
        delete App.view.items_Bar
    }
})
