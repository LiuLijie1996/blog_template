import "../scss/guestbook.scss";
import observer from "./util/Observer";
import myRequest from "./util/myRequest";

layui.use(['laypage', 'layer', 'element'], function () {
    let laypage = layui.laypage;
    //完整功能
    laypage.render({
        elem: 'paging',
        count: 100,
        layout: ['count', 'prev', 'page', 'next', 'skip'],
        jump: function (obj) {
            console.log(obj)
        }
    });
});

//发表评论时需要的字段
interface CommentKey {
    pid: string | undefined,//父级id
    content: string,//评论的内容
}

//填充到页面的评论数据
interface CommentItemData {
    id: string;//当前评论的id
    photo: string;//用户头像
    userName: string;//发表评论的用户
    content: string;//评论的内容
    time: string;//评论时间
    praiseNum: number;//点赞次数
    preComment?: CommentItemData;//上一级评论
}

//留言板实例
class GuestBook {
    private TextareaAllEle: JQuery<HTMLElement> = $(".textarea");//所有textarea文本输入框
    private EmojiBtnAllEle: JQuery<HTMLElement> = $(".emojiBtn");//所有emojiBtn表情按钮
    private SendAllEle: JQuery<HTMLElement> = $(".comments-textarea-info .layui-btn-normal");//所有发布按钮
    private ReplyBtnAllEle: JQuery<HTMLElement> = $(".reply-btn");//所有回复按钮
    private ReplyBoxAllEle: JQuery<HTMLElement> = $(".reply-box");//所有回复框
    private commentData: CommentKey = {//发表评论时需要提交的数据
        pid: "",//父级id
        content: "",//评论的内容
    };

    constructor() {
        window.onload = () => {
            //初始化
            this.init();

            $(".main-content").css({
                transform: "translateY(0)"
            });
        };
    }

    //初始化
    private init() {
        this.TextareaAllEle = $(".textarea");//所有textarea文本输入框;
        this.EmojiBtnAllEle = $(".emojiBtn");//所有emojiBtn表情按钮;
        this.SendAllEle = $(".comments-textarea-info .layui-btn-normal");//所有发布按钮;
        this.ReplyBtnAllEle = $(".reply-btn");//所有回复按钮;
        this.ReplyBoxAllEle = $(".reply-box");//所有回复框;
        this.commentData = {//发表评论时需要提交的数据
            pid: "",//父级id
            content: "",//评论的内容
        };

        /*订阅事件*/
        this.subscribe();
        /*给所有textarea文本输入框设置事件*/
        this.TextareaEvent();
        /*给所有发布按钮设置点击事件*/
        this.SendEvent();
        /*给回复按钮设置点击事件*/
        this.ReplyBtnEvent();
    }

    /*订阅事件*/
    private subscribe() {
        /*订阅发布按钮的状态事件*/
        observer.on('setSendBtnStatus', setSendBtnStatus);
    }

    /*给所有textarea文本输入框设置输入事件*/
    private TextareaEvent() {
        let _this = this;

        for (let i = 0; i < this.TextareaAllEle.length; i++) {
            /*设置emoji表情包*/
            _this.setEmoji(i);
            let textareaItem = this.TextareaAllEle[i];

            //先取消事件
            $(textareaItem).off('input');
            //再绑定事件
            $(textareaItem).on('input', function () {
                let html = $(this).html();
                //触发设置发布按钮状态事件
                observer.emit('setSendBtnStatus', $(_this.SendAllEle[i]), html);
            });
        }
    }

    /*设置emoji表情包*/
    private setEmoji(index: number) {
        // @ts-ignore
        page.Lemoji({
            emojiInput: this.TextareaAllEle[index],
            emojiBtn: this.EmojiBtnAllEle[index],
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
    }

    /*给所有发布按钮设置点击事件*/
    private SendEvent() {
        let _this = this;

        for (let i = 0; i < this.SendAllEle.length; i++) {
            let sendItem = this.SendAllEle[i];

            //先取消事件
            $(sendItem).off('click');
            //点击发布
            $(sendItem).on("click", async function () {
                let childComments: HTMLElement = $(".child-comments")[i];
                let childCommentsList: HTMLElement = $(".child-comments .comments-list")[i];

                //获取文本框内容
                // @ts-ignore
                let textContent = page.emojiParse({
                    content: $(_this.TextareaAllEle[i]).html(),
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

                // 评论的内容
                _this.commentData.content = textContent;

                //发表评论
                let result = await myRequest({
                    url: "/api/guestbook/add-comments",
                    data: _this.commentData,
                });
                console.log(result);

                //清空文本框内容
                $(_this.TextareaAllEle[i]).html("");

                //初始化
                _this.init();

                //清空内容
                _this.commentData = {
                    pid: "",
                    content: "",
                }

            });
        }
    }

    /*给回复按钮设置点击事件*/
    private ReplyBtnEvent() {
        let _this = this;

        for (let i = 0; i < this.ReplyBtnAllEle.length; i++) {
            let replyItem = this.ReplyBtnAllEle[i];

            //先取消点击事件
            $(replyItem).off('click');
            //设置点击事件
            $(replyItem).on('click', function () {
                //判断当前的回复框是否显示了
                let currentDisplay = $(_this.ReplyBoxAllEle[i]).css('display');
                //需要回复的用户的id
                let userId = $(this).attr('data-userId');

                //关闭所有的回复框
                $(_this.ReplyBoxAllEle).css({
                    display: "none",
                });

                //判断当前的回复框是否显示了
                if (currentDisplay !== 'block') {
                    //记录本次回复的用户的id
                    _this.commentData.pid = userId;

                    /*显示当前的回复框*/
                    $(_this.ReplyBoxAllEle[i]).css({
                        display: "block",
                    });
                }
            });
        }
    }
}


//设置发布按钮的状态
function setSendBtnStatus(ele: HTMLElement, html: string) {
    if (html) {
        $(ele).removeClass('gray');//删除灰色背景
        $(ele).removeAttr("disabled");//删除禁选属性
    } else {
        $(ele).addClass('gray');//添加灰色背景
        $(ele).attr("disabled", 'true');//添加禁选属性
    }
}

new GuestBook();
