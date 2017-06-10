/*
* @Author: Administrator
* @Date:   2017-04-20 09:22:54
* @Last Modified by:   Administrator
* @Last Modified time: 2017-04-20 15:14:41
*/


(function($){
    'use strict';
    // 判断是否具有CSS3 Transition特性并返回相应前缀
    var _prefix = (function(temp){
        var aPrefix = ['webkit','Moz','o','ms'];
        var prop = '';
        for (var i = 0; i < aPrefix.length; i++) {
            prop = aPrefix[i] + 'Transition';
            if(temp.style[prop] !== undefined){
                return '-' + aPrefix[i].toLowerCase() + '-';
            }
        }
        return false;
    })(document.createElement(PageSwitch));

    var PageSwitch = (function(){
            function PageSwitch(element,options){
                var me = this;
                me.settings = $.extend(true, $.fn.PageSwitch.defaults, options||{});
                me.element = element;
                me.init()
            }
            PageSwitch.prototype = {
                // 初始化 DOM 结构，绑定事件
                init: function(){
                    var me = this;
                    me.canScroll = true;
                    me.selectors = me.settings.selectors;
                    me.sections = me.element.find(me.selectors.sections);
                    me.section = me.sections.find(me.selectors.section);
                    me.pagesCount = me.countPages();
                    me.pagesClass = me.selectors.pages.substr(1);
                    me.activeClass = me.selectors.active.substr(1);
                    me.index = me.settings.others.index;  // 获取初始页面
                    me.verticalDir = (me.settings.others.direction === 'vertical')? true : false;

                    // 如果分页，则分页初始化
                    if (me.settings.others.pagination) {
                        me._initPaging();
                    }
                    // 如果页面方向改变或初始页面不为第一页，初始化布局
                    if (!me.verticalDir || me.index) {
                        me._initLayout();
                    }

                    // 初始化事件绑定
                    me._initEvent();
                },
                countPages: function(){
                    return this.section.length;
                },
                prevPage: function(){
                    var me = this;
                    if (me.index > 0) {
                        me.index--;
                    }else{
                        if (me.settings.others.loop) {
                            me.index = me.pagesCount - 1;
                        }
                    }
                    me._scrollPage();
                },
                nextPage: function(){
                    var me = this;
                    if (me.index < me.pagesCount - 1) {
                        me.index++;
                    }else {
                        if (me.settings.others.loop) {
                            me.index = 0;
                        }
                    }
                    me._scrollPage();
                },
                _scrollPage: function(){
                    var me = this;
                    var position = me.section.eq(me.index).position();
                    if(!position) return;

                    me.canScroll = false;
                    me.pageItems.eq(me.index).addClass(me.activeClass).siblings().removeClass(me.activeClass);
                    if (_prefix) {  // 若支持 transtion 特性
                        var translate = me.verticalDir ? 'translateY(-' + position.top + 'px)' : 'translateX(-' + position.left + 'px)';
                        me.sections.css(_prefix + 'transition', 'all ' + me.settings.animation.duration + 'ms ' + me.settings.animation.easing);
                        me.sections.css(_prefix + 'transform', translate);
                        
                    }else{ // 不支持则使用jQuery动画
                        var animationCss = me.verticalDir? {top: -position.top} : {left: -position.left};
                        me.sections.animate(animationCss,me.settings.duration,function(){
                            if (me.settings.others.callback) {
                                me.settings.others.callback();
                            }
                        });
                    }
                },
                _initLayout: function(){
                    var me = this;
                    if (!me.verticalDir) {
                        var width = me.pagesCount * 100 + '%';
                        var cellWidth = (100 / me.pagesCount).toFixed(2) + '%';
                        me.sections.width(width);
                        me.section.width(cellWidth).css('float','left');
                    }
                    if (me.index) {
                        me._scrollPage();
                    }
                },
                _initPaging: function(){
                    var me = this;
                    me.pagesHtml = '<ul class="' + me.pagesClass + '">';
                    for (var i = 0; i < me.pagesCount; i++) {
                        me.pagesHtml += '<li></li>'
                    }
                    me.pagesHtml += '</ul>';
                    me.element.append(me.pagesHtml);
                    var pages = me.element.find(me.selectors.pages);
                    me.pageItems = pages.find('li');
                    me.pageItems.eq(me.index).addClass(me.activeClass);

                    // 分页的布局
                    if (me.verticalDir) {
                        pages.addClass('vertical');
                    }else{
                        pages.addClass('horizontal');
                    }
                },
                _initEvent:function(){
                    var me = this;
                    // 鼠标滚轮事件
                    me.element.on('mousewheel DOMMouseScroll',function(event){
                        event.preventDefault();
                        var scrollDir = event.originalEvent.wheelDelta || -event.originalEvent.detail;
                        if (me.canScroll) {
                            if (scrollDir > 0) { // 大于零，向上滚动
                                if (me.index || me.settings.others.loop) {
                                    me.prevPage();
                                }
                                
                            }else{
                                if (me.index < me.pagesCount - 1 || me.settings.others.loop) {
                                    me.nextPage();
                                }
                                
                            }
                        }
                        
                    });
                    // 键盘事件
                    if (me.settings.others.keyboard) {
                        $(window).on('keydown',function(event){
                            var keyCode = event.keyCode;
                            if (keyCode == 37|| keyCode == 38) {
                                me.prevPage();
                            }else if (keyCode == 39 || keyCode == 40) {
                                me.nextPage();
                            }
                        });
                    }
                    // 分页点击事件
                    
                    me.element.on('click',me.selectors.pages + ' li',function(){
                        me.index = $(this).index();
                        me._scrollPage();
                    });
                    
                    // transitionEnd 事件
                    if (_prefix) {
                        me.sections.on('transitionend oTransitionEnd otransitionend webkitTranstionEnd',function(){
                            me.canScroll = true;
                            if (me.settings.others.callback && $.type(me.settings.others.callback) == 'function') {
                                me.settings.others.callback();
                            }
                        });
                    }
                    
                }
            };
            return PageSwitch;
    })();

    $.fn.PageSwitch = function(options){
        return this.each(function(){
            var me = $(this);
            var instance = me.data('PageSwitch');

            if(!instance){
                me.data('PageSwitch', (instance = new PageSwitch(me,options)));
            }

            if ($.type(options) === 'string') {
                return instance[options]();
            }
        });
    };

    $.fn.PageSwitch.defaults = {
        selectors: {
            sections: '.sections',
            section: '.section',
            pages: '.pages',
            active: '.active'
        },
        animation: {
            duration: 500,
            easing: 'ease'
        },
        others: {
            direction: 'vertical',
            pagination: true,
            keyboard: true,
            index: 0,
            loop: false,
            callback: ''
        }
    }

    $(function(){
        $('[data-PageSwitch]').PageSwitch();
    });
    
})(jQuery);