import "../scss/guestbook.scss";
import "../asset/js/emoji_jQuery.min";

$(window).on("load", function () {
    $(".main-content").css({
        transform: "translateY(0)"
    });
});

layui.use("element", function () {

});


// @ts-ignore
$.Lemoji({
    emojiInput: '#input',
    emojiBtn: '#btn',
    position: 'LEFTBOTTOM',
    length: 8,
    emojis: {
        qq: {path: 'static/images/qq/', code: ':', name: 'QQ表情'},
        tieba: {path: 'static/images/tieba', code: ';', name: "贴吧表情"},
        emoji: {path: 'static/images/emoji', code: ',', name: 'Emoji表情'}
    }
});

$('#send').click(function () {
    var content = $('#input').val();
    // @ts-ignore
    content = $.emojiParse({
        content: content,
        emojis: [{type: 'qq', path: 'static/images/qq/', code: ':'}, {
            path: 'static/images/tieba/',
            code: ';',
            type: 'tieba'
        }, {path: 'static/images/emoji/', code: ',', type: 'emoji'}]
    });
    // @ts-ignore
    $('#test').html(content);
});