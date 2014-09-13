Ext.define('App.view.userman.Login',{
    xtype: 'app-login',
    extend: 'Ext.container.Container',
    layout: 'fit',
    singleton: true,
    constrain: true,
    /* draggable: true, by 'login-dd' in constructor() */
    floating: true, shadow: false
    ,style: 'opacity: 0; background-color: #FFFFFF;'
          + 'padding: 14px; width: 354px; height: 313px;'
          + 'box-shadow:0px 10px 20px #111;'
    ,items: [{
        xtype: 'component'
       ,style: 'width: 100%; height: 100%;'
       ,html:
'<div id="progress-bar"' +
' style="background: url(css/progress-bar.gif) no-repeat center 33px;' +
'  opacity: 0;' +
'  text-align: center;' +
'  width: 100%;' +
'  height: 50px;">' +
'  <div style="text-shadow: #CCC 2px 3px 0;font: 2.2em serif;margin-bottom:22px;">'
+ l10n.um.auth +
'</div><a href="/">' + l10n.reload + '</a></div>' +
'<div id="login-view">' +
'  <div id="login-dd">'
+ l10n.app +
'</div>'
+ l10n.welcome +
'<div id="login-form"></div>'
+ l10n.um.loginInfo +
'<br/><br/>&copy; 2014 olecom@gmail.com' +
'<br/><div id="l10n" style="background-color: #D3D3D3; padding-top: 4px; margin-top: 4px;">' +
'&nbsp;<span class="ru">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>' +
'&nbsp;<span class="en">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>' +
'&nbsp;<span class="l10n-reset"><abbr title="' + l10n.um.l10nReset + '">&nbsp;&nbsp;&nbsp;</abbr></span>' +
'</div>' +
'</div>' //login
    }]

    ,id: 'login',
    constructor: function constructorLogin(){
        var me = this
        me.callParent(arguments)
        /* after initComponent()
         * Movable Container: make drag handler on top, not whole area
         */
        me.draggable = me.header = { id: 'login-dd' }// + 'cursor: move'
        Ext.panel.Panel.prototype.initSimpleDraggable.call(me)
        me.draggable = me.header = null
 	},
    destroy:function(){
        this.form.destroy()
        this.form = null
        this.callParent(arguments)
    },
    initComponent: function initLogin(){
        var me = this
           ,d = { duration: 1234, callback: null }
           ,t = { duration: d.duration }
           ,a = { duration: t.duration, height: 99, callback: null }
           ,login

        me.callParent(arguments)
        me.render(Ext.getBody())// 'cos `floating: true`

        // the fancy show up
        me.getEl().fadeIn(d)
        me.fadeOut = function(cb){
            if(cb) d.callback = cb
            me.getEl().fadeOut(d)
            d.callback = null
        }

        login = Ext.get('login')
        me.fadeInProgress = function(cb){
            Ext.get('progress-bar').fadeIn(t)
            Ext.get('login-view').fadeOut(t)
            a.height = 99
            if(cb) a.callback = cb
            login.animate(a)
            a.callback = null
        }

        me.fadeOutProgress = function(cb){
            Ext.get('progress-bar').fadeOut(t)
            Ext.get('login-view').fadeIn(t)
            a.height = 297
            if(cb) a.callback = cb
            login.animate(a)
            a.callback = null
        }

        me.form = Ext.widget({// build login form
            renderTo: 'login-form',
            xtype: 'form',
            url: '',
            frame:false,
            width: '100%',
            buttonAlign:'left',
            border:false,
            //defaultType: 'textfield',
            hideLabels: true,
            cls: 'transparent',
            margin: '20px 0 0 0',
            items: [{
                /* ExtJS 5 deprecated: 'Ext.form.field.Text'.triggers */
                xtype: 'triggerfield',
                triggerCls: 'login-shutdown',
                name: 'user',
                emptyText: l10n.um.loginUserBlank,
                width: 177,
                allowBlank: true,
                enableKeyEvents: true,
                hideTrigger: true
                //onTriggerClick: logic is in controller
            },{
                //the width of this field in the HBox layout is set directly
                //the other 2 items are given flex: 1, so will share the rest of the space
                xtype: 'combo',
                name: 'role',
                width: 177,
                queryMode: 'local',
                value: l10n.um.role,
                triggerAction: 'all',
                editable: false,
                displayField: 'role',
                valueField: '=',
                store: Ext.create('Ext.data.Store',{
                    fields: [ 'role', '=' ]
                }),
                disabled: true
            },{
                xtype: 'textfield',
                name: 'pass',
                emptyText: '*******',
                width: 133,
                inputType: 'password',
                allowBlank: false,
                disabled: true
            },{
                xtype: 'button',
                width: 133,
                iconCls: 'ok',
                itemId: 'ok',
                text: l10n.um.loginOk,
                disabled: true
            }]
        })
    }
})
