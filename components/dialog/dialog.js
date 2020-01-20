Component({
    options: {
        multipleSlots: true,
        addGlobalClass: true
    },
    properties: {
        title: {
            type: String,
            value: ''
        },
        istrue: {
            type: Boolean,
            value: false,
        },
        buttons: {
            type: Array,
            value: []
        }
    },
    data: {
    },
    ready: function ready() {
        var buttons = this.data.buttons;
        var len = buttons.length;
        buttons.forEach(function (btn, index) {
            if (len === 1) {
                btn.className = 'weui-dialog__btn_default';
            } else if (index === 0) {
                btn.className = 'weui-dialog__btn_default';
            } else {
                btn.className = 'weui-dialog__btn_primary';
            }
        });
        this.setData({
            buttons: buttons
        });
    },

    methods: {
        buttonTap: function buttonTap(e) {
            var index = e.currentTarget.dataset.index;

            this.triggerEvent('buttontap', { index: index, item: this.data.buttons[index] }, {});
        },
        closeDialog: function close() {
            this.setData({
                istrue: false
            });
        },
        stopEvent: function stopEvent() {}
    }
});