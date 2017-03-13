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
            chat_retract_title: "Click here to extend",
            anchor_schema_map: {
                chat: {
                    open: true,
                    closed: false
                }
            }
        },
        stateMap = {
            $container: null,
            anchor_map: {},
            is_chat_retracted: true
        },
        jqueryMap = {},
        setJqueryMap, toggleChat, onClickChat, initModule, copyAnchorMap, changeAnchorPart, onHashchange;
    //----------------- END MODULE SCOPE VARIABLES ---------------
    //-------------------- BEGIN UTILITY METHODS -----------------

    /** 
     * @returns Object - copy of stored anchor map; minimizes overhead
     */
    copyAnchorMap = function () {
        return $.extend(true, {}, stateMap.anchor_map);
    };

    //--------------------- END UTILITY METHODS ------------------
    //--------------------- BEGIN DOM METHODS --------------------

    /**
     * Begin DOM method /changeAnchorPart/
     * Purpose : Changes part of the URI anchor component
     * Arguments:
     * arg_map - The map describing what part of the URI anchor we want changed.
     * Returns : boolean
     * true - the Anchor portion of the URI was update
     * false - the Anchor portion of the URI could not be updated
     * Action :
     * The current anchor rep stored in stateMap.anchor_map.
     * See uriAnchor for a discussion of encoding.
     * This method
     * Creates a copy of this map using copyAnchorMap().
     * Modifies the key-values using arg_map.
     * Manages the distinction between independent and dependent values in the encoding.
     * Attempts to chnage the uri using uriAnchor
     * @returns Boolen
     * true on sucess, false on failure
     */
    changeAnchorPart = function (arg_map) {
        var anchor_map_revise = copyAnchorMap(),
            bool_return = true,
            key_name,
            key_name_dep;

        //begin merge chnages in anchor map
        for (key_name in arg_map) {
            if (arg_map.hasOwnProperty(key_name)) {
                if (key_name.indexOf('_') === 0) {
                    continue;
                }
                //update independent key values
                anchor_map_revise[key_name] = arg_map[key_name];

                //update mathing dependent key
                key_name_dep = '_' + key_name;
                if (arg_map[key_name_dep]) {
                    anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
                } else {
                    delete anchor_map_revise[key_name_dep];
                    delete anchor_map_revise['_s' + key_name_dep];
                }
            }
        }
        //begin attempt to update the URI; revert if not sucessful
        try {
            $.uriAnchor.setAnchor(anchor_map_revise);
            bool_return = false;
        } catch (error) {
            //replace URI with the exisitng stateMap
            $.uriAnchor.setAnchor(stateMap.anchor_map, null, true);
            bool_return = false;
        }
        return bool_return;
    };

    setJqueryMap = function () {
        var $container = stateMap.$container;
        jqueryMap = {
            $container: $container,
            $chat: $container.find('.spa-shell-chat')
        };
    };

    /**
     * Begin DOM method /toggleChat/
     * Purpose   : Extends or retracts chat slider
     * Arguments :
     * do_extend - if true, extends slider; if false retracts
     * callback  - optional function to execute at end of animation
     * Settings  :
     * chat_extend_time, chat_retract_time
     * chat_extend_height, chat_retract_height
     * Returns   : boolean
     * true  - slider animation activated
     * false - slider animation not activated //
     * 
     * @param {any} do_extend
     * @param {any} callback
     * @returns
     */
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

    onHashchange = function () {
        var anchor_map_previous = copyAnchorMap(),
            anchor_map_proposed,
            _s_chat_previous,
            _s_chat_proposed,
            s_chat_proposed;
        //attempt to parse the anchor
        try {
            anchor_map_proposed = $.uriAnchor.makeAnchorMap();
        } catch (error) {
            $.uriAnchor.setAnchor(anchor_map_previous, null, true);
            return false;
        }
    };

    onClickChat = function (event) {
        changeAnchorPart({
            chat: (stateMap.is_chat_retracted ? 'open' : 'closed')
        });
        return false;
    };
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