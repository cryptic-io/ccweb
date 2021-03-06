//returns the User View, this contains the fs and is the parent to the userLogin
define(["jade!templates/user/UserSpaceInfo", "tools/humanReadableByteLength"], function(userSpaceTemplate, hrByteLength){ 
    return Backbone.View.extend({
        id : "userSpaceContainer"
        , className : "floatingContainer"

        , template : userSpaceTemplate

        , initialize : function(){
            this.listenTo(this.model, 'change:fs', this.render)
            this.listenTo(this.model, 'change:loggedIn', this.render)
        }

        , render: function(){
            var totalSpace = this.model.get('totalSpace')
            , usedSpace = this.model.calcSpaceUsed()
            , percentUsed = parseInt(10000*usedSpace/totalSpace)/100+"%"

            totalSpace = hrByteLength.prettyFormat(totalSpace)
            usedSpace = hrByteLength.prettyFormat(usedSpace)

            this.$el.html(this.template({totalSpace: totalSpace, usedSpace: usedSpace, percentUsed: percentUsed}))
        }
    })
})
