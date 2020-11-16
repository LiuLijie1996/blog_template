import "../scss/guestbook.scss";

//回复框
let replyBox = `<div class="reply-height">
    <div class="commentBox">
        <!--输入框-->
        <div class="comment-input">
            <!--输入框-->
            <div class="textarea" contenteditable placeholder="拖拽一个表情过来试试"></div>

            <!--按钮-->
            <div class="comments-textarea-info">
                <div class="expression-box emojiBtn">
                    <i class="layui-icon layui-icon-face-smile"></i>
                    <span>表情</span>
                </div>
                <div class="btn-box">
                    <!--<button class="login-btn">点击登录</button>-->
                    <button class="layui-btn layui-btn-normal gray send" disabled>发布</button>
                </div>
            </div>
        </div>
    </div>
</div>`;


$(window).on("load", function () {
    $(".main-content").css({
        transform: "translateY(0)"
    });
});

layui.use("element", function () {

});


window.onload = emoji;

function emoji() {
    $(".textarea").on('input', function () {
        let html = $(this).html();
        if (html) {
            $(".comments-textarea-info .layui-btn-normal").removeClass('gray');
            $(".comments-textarea-info .layui-btn-normal").removeAttr("disabled");
        } else {
            $(".comments-textarea-info .layui-btn-normal").addClass('gray');
            $(".comments-textarea-info .layui-btn-normal").attr("disabled", 'true');
        }
    });


    // @ts-ignore
    page.Lemoji({
        emojiInput: '.textarea',
        emojiBtn: '.emojiBtn',
        position: 'LEFTBOTTOM',
        length: 8,
        emojis: {
            qq: {
                path: '/emoji_jQuery/static/images/qq/',
                code: ':',
                name: 'QQ表情'
            },
            tieba: {
                path: '/emoji_jQuery/static/images/tieba',
                code: ';',
                name: "贴吧表情"
            },
            emoji: {
                path: '/emoji_jQuery/static/images/emoji',
                code: ',',
                name: 'Emoji表情'
            }
        },
    });

    //点击发布
    $('.send').on("click", function () {
        let content = $('.textarea').html();
        // @ts-ignore
        content = page.emojiParse({
            content: content,
            emojis: [
                {
                    type: 'qq',
                    path: '/emoji_jQuery/static/images/qq/',
                    code: ':'
                },
                {
                    path: '/emoji_jQuery/static/images/tieba/',
                    code: ';',
                    type: 'tieba'
                },
                {
                    path: '/emoji_jQuery/static/images/emoji/',
                    code: ',',
                    type: 'emoji'
                }
            ]
        });
        console.log(content);
    });
};


//分页
layui.use('laypage', function () {
    var laypage = layui.laypage;

    //执行一个laypage实例
    laypage.render({
        elem: 'paging', //注意，这里的 test1 是 ID，不用加 # 号
        count: 100,
        layout: ['count', 'prev', 'page', 'next', 'skip'],
        jump: function (obj) {
            console.log(obj)
        }
    });
});


//点击回复
$(".reply-btn").on('click', function () {
    let next = $(this).parent().next();
    next.html("");
    next.append(replyBox);

    emoji();
});
