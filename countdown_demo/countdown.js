/*
* @Author: Administrator
* @Date:   2017-04-20 16:05:25
* @Last Modified by:   Administrator
* @Last Modified time: 2017-04-20 17:48:27
*/
(function($){
    'use strict';
    var CountDown = (function(){
        function CountDown(element,options){
            var me = this;
            me.settings = $.extend(true, $.fn.CountDown.defaults, options||{});
            me.element = element;
            me.init();
        }
        CountDown.prototype = {
            init: function(){
                var me = this;
                me.selectors = me.settings.selectors;
                // 初始化 DOM 结构并绑定事件
                me.screen = me.element.find(me.selectors.screen);
                me.startBtn = me.element.find(me.selectors.start);
                me.pauseBtn = me.element.find(me.selectors.pause);
                me.time = me.settings.time + ':00';
                me.screen.text(me.time);

                // 初始化动画元素
                me._initAnimationDOM();

                // 绑定事件
                me._initEvent();
            },
            _initEvent: function(){
                var me = this;
                var screenTime;
                var minutes;
                var seconds;
                var height;
                me.startBtn.on('click',function(){
                    me.intervalId = setInterval(function(){
                        screenTime = me.screen.text();
                        screenTime = screenTime.split(':');
                        screenTime = Number(screenTime[0]) * 60 + Number(screenTime[1]);
                        
                        if (screenTime === 0) {
                            me.screen.text(me.time);
                            clearInterval(me.intervalId);
                            me.countdown.height(0);
                        }else{  
                            screenTime--;                          
                            minutes = Math.floor(screenTime / 60);
                            seconds = Math.floor(screenTime % 60);
                            if (seconds < 10) {
                                seconds = '0' + seconds;
                            }
                            height = (1 - screenTime / (me.settings.time * 60)) * me.element.innerHeight();
                            var animationCss = {height: height};
                            me.countdown.animate(animationCss,me.settings.duration);
                            me.screen.text(minutes + ':' + seconds);
                        }
                    },1000);
                });
                me.pauseBtn.on('click',function(){
                    if (me.intervalId) {
                        clearInterval(me.intervalId);
                    }                    
                });
            },
            _initAnimationDOM: function(){
                var me = this;
                var animationHtml = '<div class="countdown"></div>';
                me.element.append(animationHtml);
                me.countdown = me.element.find('.countdown');
                me.countdown.css('backgroundColor',me.settings.color);
            }
        };
        return CountDown;
    })();
    $.fn.CountDown = function(options){
        var me = this;
        var instance = me.data('CountDown');
        if(!instance){
            me.data('CountDown', (instance = new CountDown(me,options)));
        }
    };
    $.fn.CountDown.defaults = {
        color: '#FF7257',
        duration: 500,
        easing: 'ease',
        time: 2,
        selectors:{
            screen: '.screen',
            start: '.start',
            pause: '.pause'
        }
    };
    $(function(){
        $('[data-CountDown]').CountDown();
    });
})(jQuery);
