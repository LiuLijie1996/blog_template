import "../scss/index.scss";

let preHover = $(".hover-this")[0];
$(".recommend .article-item").hover(function () {
    $(preHover).removeClass("hover-this");

    $(this).addClass('hover-this');

    preHover = this;
});

$(window).on("load", function () {
    $(".exhibition").css({
        transform: "translateY(0)"
    });
    $(".recommend").css({
        transform: "translateY(0)"
    });
    $(".main-content").css({
        transform: "translateY(0)"
    });
});

layui.use(['element', 'carousel'], function () {
    let element = layui.element;
    let carousel = layui.carousel;
    //建造实例
    carousel.render({
        elem: '#test1',
        width: '100%', //设置容器宽度
        height: "325px",
        arrow: 'always', //始终显示箭头
        //anim: 'updown' //切换动画方式
    });
});