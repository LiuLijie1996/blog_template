import "../scss/guestbook.scss";
import Observer from "./util/Observer";
import myRequest from "./util/myRequest";

const observer = new Observer();

layui.use(['laypage', 'layer'], function () {
    let laypage = layui.laypage;
    //完整功能
    laypage.render({
        elem: 'paging'
        , count: 100
        , layout: ['count', 'prev', 'page', 'next', 'skip']
        , jump: function (obj) {
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
    praiseNum: number;//电灶次数
    preComment?: CommentItemData;//上一级评论
}

//留言板
export class GuestBook {
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
            $(sendItem).on("click", function () {
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
                myRequest({
                    url: "/api/guestbook/add-comments",
                    data: _this.commentData,
                }).then(() => {
                    //清空文本框内容
                    $(_this.TextareaAllEle[i]).html("");

                    //触发设置发布按钮状态事件
                    observer.emit('setSendBtnStatus', $(this), "");

                    if (childCommentsList) {
                        /*如果不为空说明里面还有评论，在后面在加一个评论*/
                        $(childCommentsList).append(createCommentItem({
                            id: "123",
                            photo: "https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=1478932665,3628442590&fm=26&gp=0.jpg",
                            userName: "小红",
                            content: _this.commentData.content,
                            time: "2020年01月01日",
                            praiseNum: 123,
                            preComment: {
                                id: "789",
                                photo: "https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=1478932665,3628442590&fm=26&gp=0.jpg",
                                userName: "小美",
                                content: _this.commentData.content,
                                time: "2020年03月03日",
                                praiseNum: 789,
                            }
                        }));
                    } else {
                        //如果为空，说明下面没有一条评论，增加一条评论

                        $(childComments).append(`<ul class="comments-list">
                            ${createCommentItem({
                            id: "456",
                            photo: "https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=1478932665,3628442590&fm=26&gp=0.jpg",
                            userName: "小刚",
                            content: _this.commentData.content,
                            time: "2020年02月02日",
                            praiseNum: 456,
                            preComment: {
                                id: "789",
                                photo: "https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=1478932665,3628442590&fm=26&gp=0.jpg",
                                userName: "小美",
                                content: _this.commentData.content,
                                time: "2020年03月03日",
                                praiseNum: 789,
                            }
                        })}
                        </ul>`);
                    }

                    //初始化
                    _this.init();

                    //清空内容
                    _this.commentData = {
                        pid: "",
                        content: "",
                    }
                });
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


// //生成评论
// function createCommentItem(data: CommentItemData) {
//     let liItem = "";
//     let author = "";
//
//     //头像组件
//     let userPhoto = `<div class="user-photo">
//         <img src="${data.photo}" alt="">
//     </div>`;
//
//     // 内容
//     // 评论时间
//     // 回复框
//     let contentBox = `
//         <!--内容-->
//         <div class="text">${data.content}</div>
//         <!--评论时间-->
//         <div class="comments-info">
//             <p class="time">
//                 <i class="layui-icon layui-icon-time"></i>
//                 <span>${data.time}</span>
//             </p>
//             <p class="praise">
//                 <i class="layui-icon layui-icon-praise"></i>
//                 <span>${data.praiseNum}</span>
//             </p>
//             <p class="reply-btn" data-userId="2">
//                 <i class="layui-icon layui-icon-reply-fill"></i>
//                 <span>回复</span>
//             </p>
//         </div>
//         <!--回复框-->
//         <div class="reply-box">
//             <div class="commentBox">
//                 <!--输入框-->
//                 <div class="comment-input">
//                     <!--输入框-->
//                     <div class="textarea" contenteditable placeholder="拖拽一个表情过来试试"></div>
//
//                     <!--按钮-->
//                     <div class="comments-textarea-info">
//                         <div class="expression-box emojiBtn">
//                             <i class="layui-icon layui-icon-face-smile"></i>
//                             <span>表情</span>
//                         </div>
//                         <div class="btn-box">
//                             <!--<button class="login-btn">点击登录</button>-->
//                             <button class="layui-btn layui-btn-normal gray send" disabled>发布</button>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//         `;
//
//     //判断是否有上一级评论
//     if (data.preComment) {
//         author = `<div class="comments-author">
//             ${data.userName}<span class="color-red">回复</span>${data.preComment.userName}
//         </div>`;
//
//         liItem = `<li class="comments-text-wrap">
//             <!--用户头像-->
//             ${userPhoto}
//
//             <!--评论内容-->
//             <div class="comments-text">
//                 <!--作者-->
//                 <div class="comments-author">${author}</div>
//
//                 <!--内容-->
//                 <!--评论时间-->
//                 <!--回复框-->
//                 ${contentBox}
//
//                 <!--子集评论-->
//                 <div class="child-comments">${data.preComment.preComment ? createCommentItem(data.preComment) : ''}</div>
//             </div>
//         </li>`;
//     } else {
//         author = `<div class="comments-author">
//             <span class="color-red">${data.userName}</span>
//         </div>`;
//
//         liItem = `<li class="comments-text-wrap">
//             <!--用户头像-->
//             ${userPhoto}
//
//             <!--评论内容-->
//             <div class="comments-text">
//                 <!--作者-->
//                 <div class="comments-author">${author}</div>
//
//                 <!--内容-->
//                 <!--评论时间-->
//                 <!--回复框-->
//                 ${contentBox}
//
//                 <!--子集评论-->
//                 <div class="child-comments"></div>
//             </div>
//         </li>`;
//     }
//
//     return liItem;
// }









//生成评论
function createCommentItem(data: CommentItemData) {
    let liItem = "";
    let author = "";

    //头像组件
    let userPhoto = `<div class="user-photo">
        <img src="${data.photo}" alt="">
    </div>`;

    // 内容
    // 评论时间
    // 回复框
    let contentBox = `
        <!--内容-->
        <div class="text">${data.content}</div>
        <!--评论时间-->
        <div class="comments-info">
            <p class="time">
                <i class="layui-icon layui-icon-time"></i>
                <span>${data.time}</span>
            </p>
            <p class="praise">
                <i class="layui-icon layui-icon-praise"></i>
                <span>${data.praiseNum}</span>
            </p>
            <p class="reply-btn" data-userId="2">
                <i class="layui-icon layui-icon-reply-fill"></i>
                <span>回复</span>
            </p>
        </div>
        <!--回复框-->
        <div class="reply-box">
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
        </div>
        `;

    //作者
    author = `<div class="comments-author">
        <span class="color-red">${data.userName}</span>
    </div>`;

    liItem = `<li class="comments-text-wrap">
        <!--用户头像-->
        ${userPhoto}

        <!--评论内容-->
        <div class="comments-text">
            <!--作者-->
            <div class="comments-author">${author}</div>
            
            <!--内容-->
            <!--评论时间-->
            <!--回复框-->
            ${contentBox}

            <!--子集评论-->
            <div class="child-comments"></div>
        </div>
    </li>`;

    return liItem;
}



/*-----------测试------------*/
let commentList = [
    {
        id: "123",
        photo: "https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=1478932665,3628442590&fm=26&gp=0.jpg",
        userName: "小刚",
        content: "的说法谁付水电费；乐疯了外国片【 ",
        time: "2020年02月02日",
        praiseNum: 1,
        preComment: {
            id: "234",
            photo: "https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=1478932665,3628442590&fm=26&gp=0.jpg",
            userName: "小美",
            content: "分配阀【饿哦我【头尾【个",
            time: "2020年03月03日",
            praiseNum: 2,
            preComment: {
                id: "234",
                photo: "https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=1478932665,3628442590&fm=26&gp=0.jpg",
                userName: "小美",
                content: "吧，。吗v奋斗过来人说感觉",
                time: "2020年03月03日",
                praiseNum: 2,
                preComment: {
                    id: "234",
                    photo: "https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=1478932665,3628442590&fm=26&gp=0.jpg",
                    userName: "小美",
                    content: "路径的路附近水立方",
                    time: "2020年03月03日",
                    praiseNum: 2,
                    preComment: {
                        id: "234",
                        photo: "https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=1478932665,3628442590&fm=26&gp=0.jpg",
                        userName: "小美",
                        content: "再擦发生；电费卡彭公开",
                        time: "2020年03月03日",
                        praiseNum: 2,
                    }
                }
            }
        }
    },
    {
        id: "123",
        photo: "https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=1478932665,3628442590&fm=26&gp=0.jpg",
        userName: "小刚",
        content: "路径的路附近水立方",
        time: "2020年02月02日",
        praiseNum: 1,
        preComment: {
            id: "234",
            photo: "https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=1478932665,3628442590&fm=26&gp=0.jpg",
            userName: "小美",
            content: "法国片惹我公平惹我公平荣",
            time: "2020年03月03日",
            praiseNum: 2,
            preComment: {
                id: "234",
                photo: "https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=1478932665,3628442590&fm=26&gp=0.jpg",
                userName: "小美",
                content: "南方的公司发的果肉凭感觉热",
                time: "2020年03月03日",
                praiseNum: 2,
                preComment: {
                    id: "234",
                    photo: "https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=1478932665,3628442590&fm=26&gp=0.jpg",
                    userName: "小美",
                    content: "的风格和体会人生的发生的",
                    time: "2020年03月03日",
                    praiseNum: 2,
                    preComment: {
                        id: "234",
                        photo: "https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=1478932665,3628442590&fm=26&gp=0.jpg",
                        userName: "小美",
                        content: "的烦恼多难过法国",
                        time: "2020年03月03日",
                        praiseNum: 2,
                    }
                }
            }
        }
    },
    {
        id: "123",
        photo: "https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=1478932665,3628442590&fm=26&gp=0.jpg",
        userName: "支付",
        content: "的呢口碑平日配股怕热i个如歌",
        time: "2020年02月02日",
        praiseNum: 1,
        preComment: {
            id: "234",
            photo: "https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=1478932665,3628442590&fm=26&gp=0.jpg",
            userName: "的烦恼",
            content: "电脑的本地人风景",
            time: "2020年03月03日",
            praiseNum: 5642,
            preComment: {
                id: "234",
                photo: "https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=1478932665,3628442590&fm=26&gp=0.jpg",
                userName: "阿三",
                content: "的；胜多负少老师；看",
                time: "2020年03月03日",
                praiseNum: 2,
                preComment: {
                    id: "234",
                    photo: "https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=1478932665,3628442590&fm=26&gp=0.jpg",
                    userName: "想；",
                    content: "分；发电量看鬼片人品",
                    time: "2020年03月03日",
                    praiseNum: 2,
                    preComment: {
                        id: "234",
                        photo: "https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=1478932665,3628442590&fm=26&gp=0.jpg",
                        userName: "西欧片",
                        content: "发东三省的泼水节分平均高烹饪",
                        time: "2020年03月03日",
                        praiseNum: 2,
                    }
                }
            }
        }
    },
    {
        id: "313",
        photo: "https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=1478932665,3628442590&fm=26&gp=0.jpg",
        userName: "小刚",
        content: "威锋网【法人胃口",
        time: "2020年02月02日",
        praiseNum: 23,
        preComment: {
            id: "51",
            photo: "https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=1478932665,3628442590&fm=26&gp=0.jpg",
            userName: "小美",
            content: "额赫尔【各科",
            time: "2020年03月03日",
            praiseNum: 2,
            preComment: {
                id: "2354",
                photo: "https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=1478932665,3628442590&fm=26&gp=0.jpg",
                userName: "水库路",
                content: "范围【发给哦我国覅吗",
                time: "2020年03月03日",
                praiseNum: 54,
            }
        }
    },
];

$(".child-comments").html(`<ul class="comments-list"></ul>`);
commentList.forEach((item: CommentItemData, i: number) => {
    let ulCommentsList = $(".child-comments ul.comments-list");
    /*添加一级评论*/
    ulCommentsList.append(createCommentItem(item));
});
/*----------END-----------*/



new GuestBook();
