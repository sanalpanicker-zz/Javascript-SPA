/*
 * spa.shell.js
 * Shell module for SPA
 */
spa.shell = (function ($) {
    //---------------- BEGIN MODULE SCOPE VARIABLES --------------
    var configMap = {
            main_html: String() + '<div class="spa-shell-head">' + '<div class="spa-shell-head-logo"></div>' + '<div class="spa-shell-head-acct"></div>' + '<div class="spa-shell-head-search"></div>' + '</div>' + '<div class="spa-shell-main">' + '<div class="spa-shell-main-nav"></div>' + '<div class="spa-shell-main-content"></div>' + '</div>' + '<div class="spa-shell-foot"></div>' + '<div class="spa-shell-chat"></div>' + '<div class="spa-shell-modal"></div>' + '</div>',
            chat_extend_time: 1000,
            chat_retract_time: 300,
            chat_extend_height: 450,
            chat_retract_height: 15,
            chat_extend_title: "Click here to retract",
            chat_retract_title: "Click here to extend"
        },
        stateMap = {
            $container: null,
            is_chat_retracted: true
        },
        jqueryMap = {},
        setJqueryMap, toggleChat, onClickChat, initModule;
    //----------------- END MODULE SCOPE VARIABLES ---------------
    //-------------------- BEGIN UTILITY METHODS -----------------
    //--------------------- END UTILITY METHODS ------------------
    //--------------------- BEGIN DOM METHODS --------------------

    setJqueryMap = function () {
        var $container = stateMap.$container;
        jqueryMap = {
            $container: $container,
            $chat: $container.find('.spa-shell-chat')
        };
    };
    // Begin DOM method /toggleChat/
    // Purpose   : Extends or retracts chat slider
    // Arguments :
    //   * do_extend - if true, extends slider; if false retracts
    //   * callback  - optional function to execute at end of animation
    // Settings  :
    //   * chat_extend_time, chat_retract_time
    //   * chat_extend_height, chat_retract_height
    // Returns   : boolean
    //   * true  - slider animation activated
    // * false - slider animation not activated //
    toggleChat = function (do_extend, callback) {
        var px_chat_ht = Math.ceil(jqueryMap.$chat.height()),
            is_open = px_chat_ht === configMap.chat_extend_height,
            is_closed = px_chat_ht === configMap.chat_retract_height,
            is_sliding = !is_closed && !is_open;
        //avoid race condition
        if (is_sliding) return false;
        if (do_extend) {
            jqueryMap.$chat
                .animate({
                        height: configMap.chat_extend_height
                    },
                    configMap.chat_extend_time,
                    function () {
                        jqueryMap.$chat.attr('title', configMap.chat_extend_title);
                        stateMap.is_chat_retracted = false;
                        if (callback) {
                            callback(jqueryMap.$chat);
                        }
                    });
            return true;
        } else {
            jqueryMap.$chat
                .animate({
                        height: configMap.chat_retract_height
                    },
                    configMap.chat_retract_time,
                    function () {
                        jqueryMap.$chat.attr('title', configMap.chat_retract_title);
                        stateMap.is_chat_retracted = true;

                        if (callback) {
                            callback(jqueryMap.$chat);
                        }
                    }
                );
            return true;
        }
    };

    //--------------------- END DOM METHODS ----------------------
    //------------------- BEGIN EVENT HANDLERS -------------------
    onClickChat = function (event) {
            toggleChat(stateMap.is_chat_retracted);
            return false;
        }
        //-------------------- END EVENT HANDLERS --------------------
        //------------------- BEGIN PUBLIC METHODS -------------------
    initModule = function ($container) {
        stateMap.$container = $container;
        $container.html(configMap.main_html);
        setJqueryMap();

        stateMap.is_chat_retracted = true;
        jqueryMap.$chat
            .attr('title', configMap.chat_retract_title)
            .click(onClickChat);
        //testing
        setTimeout(function () {
            toggleChat(true);
        }, 3000);
        setTimeout(function () {
            toggleChat(false);
        }, 6000);
    };
    return {
        initModule: initModule
    };
})(jQuery);