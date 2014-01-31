﻿/*
Scripts for cnprog.com
Project Name: Lanai
All Rights Resevred 2008. CNPROG.COM
*/
var lanai = {
    /**
     * Finds any <pre><code></code></pre> tags which aren't registered for
     * pretty printing, adds the appropriate class name and invokes prettify.
     */
    highlightSyntax: function(){
        var styled = false;
        $("pre code").parent().each(function(){
            if (!$(this).hasClass('prettyprint')){
                $(this).addClass('prettyprint');
                styled = true;
            }
        });

        if (styled){
            prettyPrint();
        }
    }
};

//todo: clean-up now there is utils:WaitIcon
function appendLoader(element) {
    loading = gettext('loading...')
    element.append('<img class="ajax-loader" ' +
        'src="' + mediaUrl("media/images/indicator.gif") + '" title="' +
        loading +
        '" alt="' +
        loading +
    '" />');
}

function removeLoader() {
    $("img.ajax-loader").remove();
}

function setSubmitButtonDisabled(form, isDisabled) {
    form.find('input[type="submit"]').attr("disabled", isDisabled);
}

function enableSubmitButton(form) {
    setSubmitButtonDisabled(form, false);
}

function disableSubmitButton(form) {
    setSubmitButtonDisabled(form, true);
}

function setupFormValidation(form, validationRules, validationMessages, onSubmitCallback) {
    enableSubmitButton(form);
    form.validate({
        debug: true,
        rules: (validationRules ? validationRules : {}),
        messages: (validationMessages ? validationMessages : {}),
        errorElement: "span",
        errorClass: "form-error",
        errorPlacement: function(error, element) {
            var span = element.next().find("span.form-error");
            if (span.length === 0) {
                span = element.parent().find("span.form-error");
                if (span.length === 0){
                    //for resizable textarea
                    var element_id = element.attr('id');
                    span = $('label[for="' + element_id + '"]');
                }
            }
            span.replaceWith(error);
        },
        submitHandler: function(form_dom) {
            disableSubmitButton($(form_dom));

            if (onSubmitCallback){
                onSubmitCallback();
            }
            else{
                form_dom.submit();
            }
        }
    });
}

/**
 * generic tag cleaning function, settings
 * are from askbot live settings and askbot.const
 */
var cleanTag = function(tag_name, settings) {
    var tag_regex = new RegExp(settings['tag_regex']);
    if (tag_regex.test(tag_name) === false) {
        throw settings['messages']['wrong_chars']
    }

    var max_length = settings['max_tag_length'];
    if (tag_name.length > max_length) {
        throw interpolate(
            ngettext(
                'must be shorter than %(max_chars)s character',
                'must be shorter than %(max_chars)s characters',
                max_length
            ),
            {'max_chars': max_length },
            true
        );
    }
    if (settings['force_lowercase_tags']) {
        return tag_name.toLowerCase();
    } else {
        return tag_name;
    }
};

var validateTagLength = function(value){
    var tags = getUniqueWords(value);
    var are_tags_ok = true;
    $.each(tags, function(index, value){
        if (value.length > askbot['settings']['maxTagLength']){
            are_tags_ok = false;
        }
    });
    return are_tags_ok;
};
var validateTagCount = function(value){
    var tags = getUniqueWords(value);
    return (tags.length <= askbot['settings']['maxTagsPerPost']);
};

$.validator.addMethod('limit_tag_count', validateTagCount);
$.validator.addMethod('limit_tag_length', validateTagLength);

var CPValidator = function(){
    return {
        getQuestionFormRules : function(){
            return {
                tags: {
                    required: askbot['settings']['tagsAreRequired'],
                    maxlength: 105,
                    limit_tag_count: true,
                    limit_tag_length: true
                },
                text: {
                    minlength: askbot['settings']['minQuestionBodyLength']
                },
                title: {
                    minlength: askbot['settings']['minTitleLength']
                }
            };
        },
        getQuestionFormMessages: function(){
            return {
                tags: {
                    required: " " + gettext('tags cannot be empty'),
                    maxlength: askbot['messages']['tagLimits'],
                    limit_tag_count: askbot['messages']['maxTagsPerPost'],
                    limit_tag_length: askbot['messages']['maxTagLength']
                },
                text: {
                    required: " " + gettext('content cannot be empty'),
                    minlength: interpolate(
                                    ngettext(
                                        'question body must be > %s character',
                                        'question body must be > %s characters',
                                        askbot['settings']['minQuestionBodyLength']
                                    ),
                                    [askbot['settings']['minQuestionBodyLength'], ]
                                )
                },
                title: {
                    required: " " + gettext('please enter title'),
                    minlength: interpolate(
                                    ngettext(
                                        'title must be > %s character',
                                        'title must be > %s characters',
                                        askbot['settings']['minTitleLength']
                                    ),
                                    [askbot['settings']['minTitleLength'], ]
                                )
                }
            };
        },
        getAnswerFormRules : function(){
            return {
                text: {
                    minlength: askbot['settings']['minAnswerBodyLength']
                },
            };
        },
        getAnswerFormMessages: function(){
            return {
                text: {
                    required: " " + gettext('content cannot be empty'),
                    minlength: interpolate(
                                    ngettext(
                                        'answer must be > %s character',
                                        'answer must be > %s characters',
                                        askbot['settings']['minAnswerBodyLength']
                                    ),
                                    [askbot['settings']['minAnswerBodyLength'], ]
                                )
                },
            }
        }
    };
}();

/**
 * @constructor
 */
var ThreadUsersDialog = function() {
    SimpleControl.call(this);
    this._heading_text = 'Add heading with the setHeadingText()';
};
inherits(ThreadUsersDialog, SimpleControl);

ThreadUsersDialog.prototype.setHeadingText = function(text) {
    this._heading_text = text;
};  

ThreadUsersDialog.prototype.showUsers = function(html) {
    this._dialog.setContent(html);
    this._dialog.show();
};

ThreadUsersDialog.prototype.startShowingUsers = function() {
    var me = this;
    var threadId = this._threadId;
    var url = this._url;
    $.ajax({
        type: 'GET',
        data: {'thread_id': threadId},
        dataType: 'json',
        url: url,
        cache: false,
        success: function(data){
            if (data['success'] == true){
                me.showUsers(data['html']);
            } else {
                showMessage(me.getElement(), data['message'], 'after');
            }
        }
    });
};

ThreadUsersDialog.prototype.decorate = function(element) {
    this._element = element;
    ThreadUsersDialog.superClass_.decorate.call(this, element);
    this._threadId = element.data('threadId');
    this._url = element.data('url');
    var dialog = new ModalDialog();
    dialog.setRejectButtonText('');
    dialog.setAcceptButtonText(gettext('Back to the question'));
    dialog.setHeadingText(this._heading_text);
    dialog.setAcceptHandler(function(){ dialog.hide(); });
    var dialog_element = dialog.getElement();
    $(dialog_element).find('.modal-footer').css('text-align', 'center');
    $(document).append(dialog_element);
    this._dialog = dialog;
    var me = this;
    this.setHandler(function(){
        me.startShowingUsers();
    });
};


/**
 * @constructor
 */
var DraftPost = function() {
    WrappedElement.call(this);
};
inherits(DraftPost, WrappedElement);

/**
 * @return {string}
 */
DraftPost.prototype.getUrl = function() {
    throw 'Not Implemented';
};

/**
 * @return {boolean}
 */
DraftPost.prototype.shouldSave = function() {
    throw 'Not Implemented';
};

/**
 * @return {object} data dict
 */
DraftPost.prototype.getData = function() {
    throw 'Not Implemented';
};

DraftPost.prototype.backupData = function() {
    this._old_data = this.getData();
};

DraftPost.prototype.showNotification = function() {
    var note = $('.editor-status span');
    note.hide();
    note.html(gettext('draft saved...'));
    note.fadeIn().delay(3000).fadeOut();
};

DraftPost.prototype.getSaveHandler = function() {
    var me = this;
    return function(save_synchronously) {
        if (me.shouldSave()) {
            $.ajax({
                type: 'POST',
                cache: false,
                dataType: 'json',
                async: save_synchronously ? false : true,
                url: me.getUrl(),
                data: me.getData(),
                success: function(data) {
                    if (data['success'] && !save_synchronously) {
                        me.showNotification();
                    }
                    me.backupData();
                }
            });
        }
    };
};

DraftPost.prototype.decorate = function(element) {
    this._element = element;
    this.assignContentElements();
    this.backupData();
    setInterval(this.getSaveHandler(), 30000);//auto-save twice a minute
    var me = this;
    window.onbeforeunload = function() {
        var saveHandler = me.getSaveHandler();
        saveHandler(true);
        //var msg = gettext("%s, we've saved your draft, but...");
        //return interpolate(msg, [askbot['data']['userName']]);
    };
};


/**
 * @contstructor
 */
var DraftQuestion = function() {
    DraftPost.call(this);
};
inherits(DraftQuestion, DraftPost);

DraftQuestion.prototype.getUrl = function() {
    return askbot['urls']['saveDraftQuestion'];
};

DraftQuestion.prototype.shouldSave = function() {
    var newd = this.getData();
    var oldd = this._old_data;
    return (
        newd['title'] !== oldd['title'] ||
        newd['text'] !== oldd['text'] ||
        newd['tagnames'] !== oldd['tagnames']
    );
};

DraftQuestion.prototype.getData = function() {
    return {
        'title': this._title_element.val(),
        'text': this._text_element.val(),
        'tagnames': this._tagnames_element.val()
    };
};

DraftQuestion.prototype.assignContentElements = function() {
    this._title_element = $('#id_title');
    this._text_element = $('#editor');
    this._tagnames_element = $('#id_tags');
};

var DraftAnswer = function() {
    DraftPost.call(this);
};
inherits(DraftAnswer, DraftPost);

DraftAnswer.prototype.setThreadId = function(id) {
    this._threadId = id;
};

DraftAnswer.prototype.getUrl = function() {
    return askbot['urls']['saveDraftAnswer'];
};

DraftAnswer.prototype.shouldSave = function() {
    return this.getData()['text'] !== this._old_data['text'];
};

DraftAnswer.prototype.getData = function() {
    return {
        'text': this._textElement.val(),
        'thread_id': this._threadId
    };
};

DraftAnswer.prototype.assignContentElements = function() {
    this._textElement = $('#editor');
};


/**
 * @constructor
 * @extends {SimpleControl}
 * @param {Comment} comment to upvote
 */
var CommentVoteButton = function(comment){
    SimpleControl.call(this);
    /**
     * @param {Comment}
     */
    this._comment = comment;
    /**
     * @type {boolean}
     */
    this._voted = false;
    /**
     * @type {number}
     */
    this._score = 0;
};
inherits(CommentVoteButton, SimpleControl);
/**
 * @param {number} score
 */
CommentVoteButton.prototype.setScore = function(score){
    this._score = score;
    if (this._element){
        this._element.html(score);
    }
};
/**
 * @param {boolean} voted
 */
CommentVoteButton.prototype.setVoted = function(voted){
    this._voted = voted;
    if (this._element){
        this._element.addClass('upvoted');
    }
};

CommentVoteButton.prototype.getVoteHandler = function(){
    var me = this;
    var comment = this._comment;
    return function(){
        var voted = me._voted;
        var post_id = me._comment.getId();
        var data = {
            cancel_vote: voted ? true:false,
            post_id: post_id
        };
        $.ajax({
            type: 'POST',
            data: data,
            dataType: 'json',
            url: askbot['urls']['upvote_comment'],
            cache: false,
            success: function(data){
                if (data['success'] == true){
                    me.setScore(data['score']);
                    me.setVoted(true);
                } else {
                    showMessage(comment.getElement(), data['message'], 'after');
                }
            }
        });
    };
};

CommentVoteButton.prototype.decorate = function(element){
    this._element = element;
    this.setHandler(this.getVoteHandler());

    var element = this._element;
    var comment = this._comment;
    /* can't call comment.getElement() here due
     * an issue in the getElement() of comment
     * so use an "illegal" access to comment._element here
     */
    comment._element.mouseenter(function(){
        //outside height may not be known
        //var height = comment.getElement().height();
        //element.height(height);
        element.addClass('hover');
    });
    comment._element.mouseleave(function(){
        element.removeClass('hover');
    });

};

CommentVoteButton.prototype.createDom = function(){
    this._element = this.makeElement('div');
    if (this._score > 0){
        this._element.html(this._score);
    }
    this._element.addClass('upvote');
    if (this._voted){
        this._element.addClass('upvoted');
    }
    this.decorate(this._element);
};

/**
 * legacy Vote class
 * handles all sorts of vote-like operations
 */
var Vote = function(){
    // All actions are related to a question
    var questionId;
    //question slug to build redirect urls
    var questionSlug;
    // The object we operate on actually. It can be a question or an answer.
    var postId;
    var questionAuthorId;
    var currentUserId;
    var answerContainerIdPrefix = 'post-id-';
    var voteContainerId = 'vote-buttons';
    var imgIdPrefixAccept = 'answer-img-accept-';
    var classPrefixFollow= 'button follow';
    var classPrefixFollowed= 'button followed';
    var imgIdPrefixQuestionVoteup = 'question-img-upvote-';
    var imgIdPrefixQuestionVotedown = 'question-img-downvote-';
    var imgIdPrefixAnswerVoteup = 'answer-img-upvote-';
    var imgIdPrefixAnswerVotedown = 'answer-img-downvote-';
    var divIdFavorite = 'favorite-number';
    var commentLinkIdPrefix = 'comment-';
    var voteNumberClass = "vote-number";
    var offensiveIdPrefixQuestionFlag = 'question-offensive-flag-';
    var removeOffensiveIdPrefixQuestionFlag = 'question-offensive-remove-flag-';
    var removeAllOffensiveIdPrefixQuestionFlag = 'question-offensive-remove-all-flag-';
    var offensiveIdPrefixAnswerFlag = 'answer-offensive-flag-';
    var removeOffensiveIdPrefixAnswerFlag = 'answer-offensive-remove-flag-';
    var removeAllOffensiveIdPrefixAnswerFlag = 'answer-offensive-remove-all-flag-';
    var offensiveClassFlag = 'offensive-flag';
    var questionControlsId = 'question-controls';
    var removeAnswerLinkIdPrefix = 'answer-delete-link-';
    var questionSubscribeUpdates = 'question-subscribe-updates';
    var questionSubscribeSidebar= 'question-subscribe-sidebar';

    var acceptAnonymousMessage = gettext('insufficient privilege');
    var acceptOwnAnswerMessage = gettext('cannot pick own answer as best');

    var pleaseLogin = " <a href='" + askbot['urls']['user_signin'] + ">"
                        + gettext('please login') + "</a>";

    var favoriteAnonymousMessage = gettext('anonymous users cannot follow questions') + pleaseLogin;
    var subscribeAnonymousMessage = gettext('anonymous users cannot subscribe to questions') + pleaseLogin;
    var voteAnonymousMessage = gettext('anonymous users cannot vote') + pleaseLogin;
    //there were a couple of more messages...
    var offensiveConfirmation = gettext('please confirm offensive');
    var removeOffensiveConfirmation = gettext('please confirm removal of offensive flag');
    var offensiveAnonymousMessage = gettext('anonymous users cannot flag offensive posts') + pleaseLogin;
    var removeConfirmation = gettext('confirm delete');
    var removeAnonymousMessage = gettext('anonymous users cannot delete/undelete') + pleaseLogin;
    var recoveredMessage = gettext('post recovered');
    var deletedMessage = gettext('post deleted');

    var VoteType = {
        acceptAnswer : 0,
        questionUpVote : 1,
        questionDownVote : 2,
        favorite : 4,
        answerUpVote: 5,
        answerDownVote:6,
        offensiveQuestion : 7,
        removeOffensiveQuestion : 7.5,
        removeAllOffensiveQuestion : 7.6,
        offensiveAnswer:8,
        removeOffensiveAnswer:8.5,
        removeAllOffensiveAnswer:8.6,
        removeQuestion: 9,//deprecate
        removeAnswer:10,//deprecate
        questionSubscribeUpdates:11,
        questionUnsubscribeUpdates:12
    };

    var getFavoriteButton = function(){
        var favoriteButton = 'div.'+ voteContainerId +' a[class="'+ classPrefixFollow +'"]';
        favoriteButton += ', div.'+ voteContainerId +' a[class="'+ classPrefixFollowed +'"]';
        return $(favoriteButton);
    };
    var getFavoriteNumber = function(){
        var favoriteNumber = '#'+ divIdFavorite ;
        return $(favoriteNumber);
    };
    var getQuestionVoteUpButton = function(){
        var questionVoteUpButton = 'div.'+ voteContainerId +' div[id^="'+ imgIdPrefixQuestionVoteup +'"]';
        return $(questionVoteUpButton);
    };
    var getQuestionVoteDownButton = function(){
        var questionVoteDownButton = 'div.'+ voteContainerId +' div[id^="'+ imgIdPrefixQuestionVotedown +'"]';
        return $(questionVoteDownButton);
    };
    var getAnswerVoteUpButtons = function(){
        var answerVoteUpButton = 'div.'+ voteContainerId +' div[id^="'+ imgIdPrefixAnswerVoteup +'"]';
        return $(answerVoteUpButton);
    };
    var getAnswerVoteDownButtons = function(){
        var answerVoteDownButton = 'div.'+ voteContainerId +' div[id^="'+ imgIdPrefixAnswerVotedown +'"]';
        return $(answerVoteDownButton);
    };
    var getAnswerVoteUpButton = function(id){
        var answerVoteUpButton = 'div.'+ voteContainerId +' div[id="'+ imgIdPrefixAnswerVoteup + id + '"]';
        return $(answerVoteUpButton);
    };
    var getAnswerVoteDownButton = function(id){
        var answerVoteDownButton = 'div.'+ voteContainerId +' div[id="'+ imgIdPrefixAnswerVotedown + id + '"]';
        return $(answerVoteDownButton);
    };

    var getOffensiveQuestionFlag = function(){
        var offensiveQuestionFlag = '#question-table span[id^="'+ offensiveIdPrefixQuestionFlag +'"]';
        return $(offensiveQuestionFlag);
    };

    var getRemoveOffensiveQuestionFlag = function(){
        var removeOffensiveQuestionFlag = '#question-table span[id^="'+ removeOffensiveIdPrefixQuestionFlag +'"]';
        return $(removeOffensiveQuestionFlag);
    };

    var getRemoveAllOffensiveQuestionFlag = function(){
        var removeAllOffensiveQuestionFlag = '#question-table span[id^="'+ removeAllOffensiveIdPrefixQuestionFlag +'"]';
        return $(removeAllOffensiveQuestionFlag);
    };

    var getOffensiveAnswerFlags = function(){
        var offensiveQuestionFlag = 'div.answer span[id^="'+ offensiveIdPrefixAnswerFlag +'"]';
        return $(offensiveQuestionFlag);
    };

    var getRemoveOffensiveAnswerFlag = function(){
        var removeOffensiveAnswerFlag = 'div.answer span[id^="'+ removeOffensiveIdPrefixAnswerFlag +'"]';
        return $(removeOffensiveAnswerFlag);
    };

    var getRemoveAllOffensiveAnswerFlag = function(){
        var removeAllOffensiveAnswerFlag = 'div.answer span[id^="'+ removeAllOffensiveIdPrefixAnswerFlag +'"]';
        return $(removeAllOffensiveAnswerFlag);
    };

    var getquestionSubscribeUpdatesCheckbox = function(){
        return $('#' + questionSubscribeUpdates);
    };

    var getquestionSubscribeSidebarCheckbox= function(){
        return $('#' + questionSubscribeSidebar);
    };

    var getremoveAnswersLinks = function(){
        var removeAnswerLinks = 'div.answer-controls a[id^="'+ removeAnswerLinkIdPrefix +'"]';
        return $(removeAnswerLinks);
    };

    var setVoteImage = function(voteType, undo, object){
        var flag = undo ? false : true;
        if (object.hasClass("on")) {
          object.removeClass("on");
        }else{
          object.addClass("on");
        }

        if(undo){
            if(voteType == VoteType.questionUpVote || voteType == VoteType.questionDownVote){
                $(getQuestionVoteUpButton()).removeClass("on");
                $(getQuestionVoteDownButton()).removeClass("on");
            }
            else{
                $(getAnswerVoteUpButton(postId)).removeClass("on");
                $(getAnswerVoteDownButton(postId)).removeClass("on");
            }
        }
    };

    var setVoteNumber = function(object, number){
        var voteNumber = object.parent('div.'+ voteContainerId).find('div.'+ voteNumberClass);
        $(voteNumber).text(number);
    };

    var bindEvents = function(){
        // accept answers
        var acceptedButtons = 'div.'+ voteContainerId +' div[id^="'+ imgIdPrefixAccept +'"]';
        $(acceptedButtons).unbind('click').click(function(event){
           Vote.accept($(event.target));
        });
        // set favorite question
        var favoriteButton = getFavoriteButton();
        favoriteButton.unbind('click').click(function(event){
           //Vote.favorite($(event.target));
           Vote.favorite(favoriteButton);
        });

        // question vote up
        var questionVoteUpButton = getQuestionVoteUpButton();
        questionVoteUpButton.unbind('click').click(function(event){
           Vote.vote($(event.target), VoteType.questionUpVote);
        });

        var questionVoteDownButton = getQuestionVoteDownButton();
        questionVoteDownButton.unbind('click').click(function(event){
           Vote.vote($(event.target), VoteType.questionDownVote);
        });

        var answerVoteUpButton = getAnswerVoteUpButtons();
        answerVoteUpButton.unbind('click').click(function(event){
           Vote.vote($(event.target), VoteType.answerUpVote);
        });

        var answerVoteDownButton = getAnswerVoteDownButtons();
        answerVoteDownButton.unbind('click').click(function(event){
           Vote.vote($(event.target), VoteType.answerDownVote);
        });

        getOffensiveQuestionFlag().unbind('click').click(function(event){
           Vote.offensive(this, VoteType.offensiveQuestion);
        });

        getRemoveOffensiveQuestionFlag().unbind('click').click(function(event){
           Vote.remove_offensive(this, VoteType.removeOffensiveQuestion);
        });

        getRemoveAllOffensiveQuestionFlag().unbind('click').click(function(event){
           Vote.remove_all_offensive(this, VoteType.removeAllOffensiveQuestion);
        });

        getOffensiveAnswerFlags().unbind('click').click(function(event){
           Vote.offensive(this, VoteType.offensiveAnswer);
        });

        getRemoveOffensiveAnswerFlag().unbind('click').click(function(event){
           Vote.remove_offensive(this, VoteType.removeOffensiveAnswer);
        });

        getRemoveAllOffensiveAnswerFlag().unbind('click').click(function(event){
           Vote.remove_all_offensive(this, VoteType.removeAllOffensiveAnswer);
        });

        getquestionSubscribeUpdatesCheckbox().unbind('click').click(function(event){
            //despeluchar esto
            if (this.checked){
                getquestionSubscribeSidebarCheckbox().attr({'checked': true});
                Vote.vote($(event.target), VoteType.questionSubscribeUpdates);
            }
            else {
                getquestionSubscribeSidebarCheckbox().attr({'checked': false});
                Vote.vote($(event.target), VoteType.questionUnsubscribeUpdates);
            }
        });

        getquestionSubscribeSidebarCheckbox().unbind('click').click(function(event){
            if (this.checked){
                getquestionSubscribeUpdatesCheckbox().attr({'checked': true});
                Vote.vote($(event.target), VoteType.questionSubscribeUpdates);
            }
            else {
                getquestionSubscribeUpdatesCheckbox().attr({'checked': false});
                Vote.vote($(event.target), VoteType.questionUnsubscribeUpdates);
            }
        });

        getremoveAnswersLinks().unbind('click').click(function(event){
            Vote.remove(this, VoteType.removeAnswer);
        });
    };

    var submit = function(object, voteType, callback) {
        //this function submits votes
        $.ajax({
            type: "POST",
            cache: false,
            dataType: "json",
            url: askbot['urls']['vote_url'],
            data: { "type": voteType, "postId": postId },
            error: handleFail,
            success: function(data) {
                    callback(object, voteType, data);
                }
            });
    };

    var handleFail = function(xhr, msg){
        alert("Callback invoke error: " + msg);
    };

    // callback function for Accept Answer action
    var callback_accept = function(object, voteType, data){
        if(data.allowed == "0" && data.success == "0"){
            showMessage(object, acceptAnonymousMessage);
        }
        else if(data.allowed == "-1"){
            showMessage(object, acceptOwnAnswerMessage);
        }
        else if(data.status == "1"){
            $("#"+answerContainerIdPrefix+postId).removeClass("accepted-answer");
            $("#"+commentLinkIdPrefix+postId).removeClass("comment-link-accepted");
        }
        else if(data.success == "1"){
            var answers = ('div[id^="'+answerContainerIdPrefix +'"]');
            $(answers).removeClass('accepted-answer');
            var commentLinks = ('div[id^="'+answerContainerIdPrefix +'"] div[id^="'+ commentLinkIdPrefix +'"]');
            $(commentLinks).removeClass("comment-link-accepted");

            $("#"+answerContainerIdPrefix+postId).addClass("accepted-answer");
            $("#"+commentLinkIdPrefix+postId).addClass("comment-link-accepted");
        }
        else{
            showMessage(object, data.message);
        }
    };

    var callback_favorite = function(object, voteType, data){
        if(data.allowed == "0" && data.success == "0"){
            showMessage(
                object,
                favoriteAnonymousMessage.replace(
                        '{{QuestionID}}',
                        questionId).replace(
                        '{{questionSlug}}',
                        ''
                    )
            );
        }
        else if(data.status == "1"){
            var follow_html = gettext('Follow');
            object.attr("class", 'button follow');
            object.html(follow_html);
            var fav = getFavoriteNumber();
            fav.removeClass("my-favorite-number");
            if(data.count === 0){
                data.count = '';
                fav.text('');
            }else{
                var fmts = ngettext('%s follower', '%s followers', data.count);
                fav.text(interpolate(fmts, [data.count]));
            }
        }
        else if(data.success == "1"){
            var followed_html = gettext('<div>Following</div><div class="unfollow">Unfollow</div>');
            object.html(followed_html);
            object.attr("class", 'button followed');
            var fav = getFavoriteNumber();
            var fmts = ngettext('%s follower', '%s followers', data.count);
            fav.text(interpolate(fmts, [data.count]));
            fav.addClass("my-favorite-number");
        }
        else{
            showMessage(object, data.message);
        }
    };

    var callback_vote = function(object, voteType, data){
        if (data.success == '0'){
            showMessage(object, data.message);
            return;
        }
        else {
            if (data.status == '1'){
                setVoteImage(voteType, true, object);
            }
            else {
                setVoteImage(voteType, false, object);
            }
            setVoteNumber(object, data.count);
            if (data.message && data.message.length > 0){
                showMessage(object, data.message);
            }
            return;
        }
        //may need to take a look at this again
        if (data.status == "1"){
            setVoteImage(voteType, true, object);
            setVoteNumber(object, data.count);
        }
        else if (data.success == "1"){
            setVoteImage(voteType, false, object);
            setVoteNumber(object, data.count);
            if (data.message.length > 0){
                showMessage(object, data.message);
            }
        }
    };

    var callback_offensive = function(object, voteType, data){
        //todo: transfer proper translations of these from i18n.js
        //to django.po files
        //_('anonymous users cannot flag offensive posts') + pleaseLogin;
        if (data.success == "1"){
            if(data.count > 0)
                $(object).children('span[class="darkred"]').text("("+ data.count +")");
            else
                $(object).children('span[class="darkred"]').text("");

            // Change the link text and rebind events
            $(object).find("a.question-flag").html(gettext("remove flag"));
            var obj_id = $(object).attr("id");
            $(object).attr("id", obj_id.replace("flag-", "remove-flag-"));

            getRemoveOffensiveQuestionFlag().unbind('click').click(function(event){
               Vote.remove_offensive(this, VoteType.removeOffensiveQuestion);
            });

            getRemoveOffensiveAnswerFlag().unbind('click').click(function(event){
               Vote.remove_offensive(this, VoteType.removeOffensiveAnswer);
            });
        }
        else {
            object = $(object);
            showMessage(object, data.message)
        }
    };

    var callback_remove_offensive = function(object, voteType, data){
        //todo: transfer proper translations of these from i18n.js
        //to django.po files
        //_('anonymous users cannot flag offensive posts') + pleaseLogin;
        if (data.success == "1"){
            if(data.count > 0){
                $(object).children('span[class="darkred"]').text("("+ data.count +")");                
            }
            else{
                $(object).children('span[class="darkred"]').text("");
                // Remove "remove all flags link" since there are no more flags to remove
                var remove_all = $(object).siblings('span.offensive-flag[id*="-offensive-remove-all-flag-"]');
                $(remove_all).next("span.sep").remove();
                $(remove_all).remove();
            }
            // Change the link text and rebind events
            $(object).find("a.question-flag").html(gettext("flag offensive"));
            var obj_id = $(object).attr("id");
            $(object).attr("id", obj_id.replace("remove-flag-", "flag-"));

             getOffensiveQuestionFlag().unbind('click').click(function(event){
               Vote.offensive(this, VoteType.offensiveQuestion);
            });

            getOffensiveAnswerFlags().unbind('click').click(function(event){
               Vote.offensive(this, VoteType.offensiveAnswer);
            });
        }
        else {
            object = $(object);
            showMessage(object, data.message)
        }
    };

    var callback_remove_all_offensive = function(object, voteType, data){
        //todo: transfer proper translations of these from i18n.js
        //to django.po files
        //_('anonymous users cannot flag offensive posts') + pleaseLogin;
        if (data.success == "1"){
            if(data.count > 0)
                $(object).children('span[class="darkred"]').text("("+ data.count +")");
            else
                $(object).children('span[class="darkred"]').text("");
            // remove the link. All flags are gone
            var remove_own = $(object).siblings('span.offensive-flag[id*="-offensive-remove-flag-"]');
            $(remove_own).find("a.question-flag").html(gettext("flag offensive"));
            $(remove_own).attr("id", $(remove_own).attr("id").replace("remove-flag-", "flag-"));
            
            $(object).next("span.sep").remove();
            $(object).remove();



             getOffensiveQuestionFlag().unbind('click').click(function(event){
               Vote.offensive(this, VoteType.offensiveQuestion);
            });

            getOffensiveAnswerFlags().unbind('click').click(function(event){
               Vote.offensive(this, VoteType.offensiveAnswer);
            });
        }
        else {
            object = $(object);
            showMessage(object, data.message)
        }
    };

    var callback_remove = function(object, voteType, data){
        if (data.success == "1"){
            if (removeActionType == 'delete'){
                postNode.addClass('deleted');
                postRemoveLink.innerHTML = gettext('undelete');
                showMessage(object, deletedMessage);
            }
            else if (removeActionType == 'undelete') {
                postNode.removeClass('deleted');
                postRemoveLink.innerHTML = gettext('delete');
                showMessage(object, recoveredMessage);
            }
        }
        else {
            showMessage(object, data.message)
        }
    };

    return {
        init : function(qId, qSlug, questionAuthor, userId){
            questionId = qId;
            questionSlug = qSlug;
            questionAuthorId = questionAuthor;
            currentUserId = userId;
            bindEvents();
        },

        //accept answer
        accept: function(object){
            postId = object.attr("id").substring(imgIdPrefixAccept.length);
            submit(object, VoteType.acceptAnswer, callback_accept);
        },
        //mark question as favorite
        favorite: function(object){
            if (!currentUserId || currentUserId.toUpperCase() == "NONE"){
                showMessage(
                    object,
                    favoriteAnonymousMessage.replace(
                            "{{QuestionID}}",
                            questionId
                        ).replace(
                            '{{questionSlug}}',
                            questionSlug
                        )
                );
                return false;
            }
            submit(object, VoteType.favorite, callback_favorite);
        },

        vote: function(object, voteType){
            if (!currentUserId || currentUserId.toUpperCase() == "NONE"){
                if (voteType == VoteType.questionSubscribeUpdates || voteType == VoteType.questionUnsubscribeUpdates){
                    getquestionSubscribeSidebarCheckbox().removeAttr('checked');
                    getquestionSubscribeUpdatesCheckbox().removeAttr('checked');
                    showMessage(object, subscribeAnonymousMessage);
                }else {
                    showMessage(
                        $(object),
                        voteAnonymousMessage.replace(
                                "{{QuestionID}}",
                                questionId
                            ).replace(
                                '{{questionSlug}}',
                                questionSlug
                            )
                    );
                }
                return false;
            }
            // up and downvote processor
            if (voteType == VoteType.answerUpVote){
                postId = object.attr("id").substring(imgIdPrefixAnswerVoteup.length);
            }
            else if (voteType == VoteType.answerDownVote){
                postId = object.attr("id").substring(imgIdPrefixAnswerVotedown.length);
            }

            submit(object, voteType, callback_vote);
        },
        //flag offensive
        offensive: function(object, voteType){
            if (!currentUserId || currentUserId.toUpperCase() == "NONE"){
                showMessage(
                    $(object),
                    offensiveAnonymousMessage.replace(
                            "{{QuestionID}}",
                            questionId
                        ).replace(
                            '{{questionSlug}}',
                            questionSlug
                        )
                );
                return false;
            }
            if (confirm(offensiveConfirmation)){
                postId = object.id.substr(object.id.lastIndexOf('-') + 1);
                submit(object, voteType, callback_offensive);
            }
        },
        //remove flag offensive
        remove_offensive: function(object, voteType){
            if (!currentUserId || currentUserId.toUpperCase() == "NONE"){
                showMessage(
                    $(object),
                    offensiveAnonymousMessage.replace(
                            "{{QuestionID}}",
                            questionId
                        ).replace(
                            '{{questionSlug}}',
                            questionSlug
                        )
                );
                return false;
            }
            if (confirm(removeOffensiveConfirmation)){
                postId = object.id.substr(object.id.lastIndexOf('-') + 1);
                submit(object, voteType, callback_remove_offensive);
            }
        },
        remove_all_offensive: function(object, voteType){
            if (!currentUserId || currentUserId.toUpperCase() == "NONE"){
                showMessage(
                    $(object),
                    offensiveAnonymousMessage.replace(
                            "{{QuestionID}}",
                            questionId
                        ).replace(
                            '{{questionSlug}}',
                            questionSlug
                        )
                );
                return false;
            }
            if (confirm(removeOffensiveConfirmation)){
                postId = object.id.substr(object.id.lastIndexOf('-') + 1);
                submit(object, voteType, callback_remove_all_offensive);
            }
        },
        //delete question or answer (comments are deleted separately)
        remove: function(object, voteType){
            if (!currentUserId || currentUserId.toUpperCase() == "NONE"){
                showMessage(
                    $(object),
                    removeAnonymousMessage.replace(
                            '{{QuestionID}}',
                            questionId
                        ).replace(
                            '{{questionSlug}}',
                            questionSlug
                        )
                    );
                return false;
            }
            bits = object.id.split('-');
            postId = bits.pop();/* this seems to be used within submit! */
            postType = bits.shift();

            var do_proceed = false;
            if (postType == 'answer'){
                postNode = $('#post-id-' + postId);
            }
            else if (postType == 'question'){
                postNode = $('#question-table');
            }
            postRemoveLink = object;
            if (postNode.hasClass('deleted')){
                removeActionType = 'undelete';
                do_proceed = true;
            }
            else {
                removeActionType = 'delete';
                do_proceed = confirm(removeConfirmation);
            }
            if (do_proceed) {
                submit($(object), voteType, callback_remove);
            }
        }
    };
} ();

var questionRetagger = function(){

    var oldTagsHTML = '';
    var tagInput = null;
    var tagsDiv = null;
    var retagLink = null;

    var restoreEventHandlers = function(){
        $(document).unbind('click');
    };

    var cancelRetag = function(){
        tagsDiv.html(oldTagsHTML);
        tagsDiv.removeClass('post-retag');
        tagsDiv.addClass('post-tags');
        restoreEventHandlers();
        initRetagger();
    };

    var drawNewTags = function(new_tags){
        tagsDiv.empty();
        if (new_tags === ''){
            return;
        }
        new_tags = new_tags.split(/\s+/);
        var tags_html = ''
        $.each(new_tags, function(index, name){
            var tag = new Tag();
            tag.setName(name);
            tagsDiv.append(tag.getElement());
        });
    };

    var doRetag = function(){
        $.ajax({
            type: "POST",
            url: retagUrl,//todo add this url to askbot['urls']
            dataType: "json",
            data: { tags: getUniqueWords(tagInput.val()).join(' ') },
            success: function(json) {
                if (json['success'] === true){
                    new_tags = getUniqueWords(json['new_tags']);
                    oldTagsHtml = '';
                    cancelRetag();
                    drawNewTags(new_tags.join(' '));
                    if (json['message']) {
                        notify.show(json['message']);
                    }
                }
                else {
                    cancelRetag();
                    showMessage(tagsDiv, json['message']);
                }
            },
            error: function(xhr, textStatus, errorThrown) {
                showMessage(tagsDiv, 'sorry, something is not right here');
                cancelRetag();
            }
        });
        return false;
    }

    var setupInputEventHandlers = function(input){
        input.keydown(function(e){
            if ((e.which && e.which == 27) || (e.keyCode && e.keyCode == 27)){
                cancelRetag();
            }
        });
        $(document).unbind('click').click(cancelRetag, false);
        input.click(function(){return false});
    };

    var createRetagForm = function(old_tags_string){
        var div = $('<form method="post"></form>');
        tagInput = $('<input id="retag_tags" type="text" autocomplete="off" name="tags" size="30"/>');
        //var tagLabel = $('<label for="retag_tags" class="error"></label>');
        //populate input
        var tagAc = new AutoCompleter({
            url: askbot['urls']['get_tag_list'],
            preloadData: true,
            minChars: 1,
            useCache: true,
            matchInside: true,
            maxCacheLength: 100,
            delay: 10
        });
        tagAc.decorate(tagInput);
        tagInput.val(old_tags_string);
        div.append(tagInput);
        //div.append(tagLabel);
        setupInputEventHandlers(tagInput);

        //button = $('<input type="submit" />');
        //button.val(gettext('save tags'));
        //div.append(button);
        //setupButtonEventHandlers(button);
        div.validate({//copy-paste from utils.js
            rules: {
                tags: {
                    required: askbot['settings']['tagsAreRequired'],
                    maxlength: askbot['settings']['maxTagsPerPost'] * askbot['settings']['maxTagLength'],
                    limit_tag_count: true,
                    limit_tag_length: true
                }
            },
            messages: {
                tags: {
                    required: gettext('tags cannot be empty'),
                    maxlength: askbot['messages']['tagLimits'],
                    limit_tag_count: askbot['messages']['maxTagsPerPost'],
                    limit_tag_length: askbot['messages']['maxTagLength']
                }
            },
            submitHandler: doRetag,
            errorClass: "retag-error"
        });

        return div;
    };

    var getTagsAsString = function(tags_div){
        var links = tags_div.find('a');
        var tags_str = '';
        links.each(function(index, element){
            if (index === 0){
                //this is pretty bad - we should use Tag.getName()
                tags_str = $(element).data('tagName');
            }
            else {
                tags_str += ' ' + $(element).data('tagName');
            }
        });
        return tags_str;
    };

    var noopHandler = function(){
        tagInput.focus();
        return false;
    };

    var deactivateRetagLink = function(){
        retagLink.unbind('click').click(noopHandler);
        retagLink.unbind('keypress').keypress(noopHandler);
    };

    var startRetag = function(){
        tagsDiv = $('#question-tags');
        oldTagsHTML = tagsDiv.html();//save to restore on cancel
        var old_tags_string = getTagsAsString(tagsDiv);
        var retag_form = createRetagForm(old_tags_string);
        tagsDiv.html('');
        tagsDiv.append(retag_form);
        tagsDiv.removeClass('post-tags');
        tagsDiv.addClass('post-retag');
        tagInput.focus();
        deactivateRetagLink();
        return false;
    };

    var setupClickAndEnterHandler = function(element, callback){
        element.unbind('click').click(callback);
        element.unbind('keypress').keypress(function(e){
            if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)){
                callback();
            }
        });
    }

    var initRetagger = function(){
        setupClickAndEnterHandler(retagLink, startRetag);
    };

    return {
        init: function(){
            retagLink = $('#retag');
            initRetagger();
        }
    };
}();

var DeletePostLink = function(){
    SimpleControl.call(this);
    this._post_id = null;
};
inherits(DeletePostLink, SimpleControl);

DeletePostLink.prototype.setPostId = function(id){
    this._post_id = id;
};

DeletePostLink.prototype.getPostId = function(){
    return this._post_id;
};

DeletePostLink.prototype.getPostElement = function(){
    return $('#post-id-' + this.getPostId());
};

DeletePostLink.prototype.isPostDeleted = function(){
    return this._post_deleted;
};

DeletePostLink.prototype.setPostDeleted = function(is_deleted){
    var post = this.getPostElement();
    if (is_deleted === true){
        post.addClass('deleted');
        this._post_deleted = true;
        this.getElement().html(gettext('undelete'));
    } else if (is_deleted === false){
        post.removeClass('deleted');
        this._post_deleted = false;
        this.getElement().html(gettext('delete'));
    }
};

DeletePostLink.prototype.getDeleteHandler = function(){
    var me = this;
    var post_id = this.getPostId();
    return function(){
        var data = {
            'post_id': me.getPostId(),
            //todo rename cancel_vote -> undo 
            'cancel_vote': me.isPostDeleted() ? true: false
        };
        $.ajax({
            type: 'POST',
            data: data,
            dataType: 'json',
            url: askbot['urls']['delete_post'],
            cache: false,
            success: function(data){
                if (data['success'] == true){
                    me.setPostDeleted(data['is_deleted']);
                } else {
                    showMessage(me.getElement(), data['message']);
                }
            }
        });
    };
};

DeletePostLink.prototype.decorate = function(element){
    this._element = element;
    this._post_deleted = this.getPostElement().hasClass('deleted');
    this.setHandler(this.getDeleteHandler());
}

//constructor for the form
var EditCommentForm = function(){
    WrappedElement.call(this);
    this._comment = null;
    this._comment_widget = null;
    this._element = null;
    this._text = '';
    this._id = 'edit-comment-form';
};
inherits(EditCommentForm, WrappedElement);

EditCommentForm.prototype.getElement = function(){
    EditCommentForm.superClass_.getElement.call(this);
    this._textarea.val(this._text);
    return this._element;
};

EditCommentForm.prototype.attachTo = function(comment, mode){
    this._comment = comment;
    this._type = mode;
    this._comment_widget = comment.getContainerWidget();
    this._text = comment.getText();
    comment.getElement().after(this.getElement());
    comment.getElement().hide();
    this._comment_widget.hideButton();
    if (this._type == 'add'){
        this._submit_btn.html(gettext('add comment'));
    }
    else {
        this._submit_btn.html(gettext('save comment'));
    }
    this.getElement().show();
    this.enableForm();
    this.focus();
    putCursorAtEnd(this._textarea);
};

EditCommentForm.prototype.getCounterUpdater = function(){
    //returns event handler
    var counter = this._text_counter;
    var handler = function(){
        var textarea = $(this);
        var length = textarea.val() ? textarea.val().length : 0;
        var length1 = maxCommentLength - 100;
        if (length1 < 0){
            length1 = Math.round(0.7*maxCommentLength);
        }
        var length2 = maxCommentLength - 30;
        if (length2 < 0){
            length2 = Math.round(0.9*maxCommentLength);
        }

        //todo:
        //1) use class instead of color - move color def to css
        var color = 'maroon';
        var chars = 10;
        if (length === 0){
            var feedback = interpolate(gettext('%s title minchars'), [chars]);
        }
        else if (length < 10){
            var feedback = interpolate(gettext('enter %s more characters'), [chars - length]);
        }
        else {
            color = length > length2 ? "#f00" : length > length1 ? "#f60" : "#999"
			chars = maxCommentLength - length
            var feedback = interpolate(gettext('%s characters left'), [chars])
        }
        counter.html(feedback).css('color', color)
    };
    return handler;
};

EditCommentForm.prototype.canCancel = function(){
    if (this._element === null){
        return true;
    }
    var ctext = $.trim(this._textarea.val());
    if ($.trim(ctext) == $.trim(this._text)){
        return true;
    }
    else if (this.confirmAbandon()){
        return true;
    }
    this.focus();
    return false;
};

EditCommentForm.prototype.getCancelHandler = function(){
    var form = this;
    return function(){
        if (form.canCancel()){
            form.detach();
        }
        return false;
    };
};

EditCommentForm.prototype.detach = function(){
    if (this._comment === null){
        return;
    }
    this._comment.getContainerWidget().showButton();
    if (this._comment.isBlank()){
        this._comment.dispose();
    }
    else {
        this._comment.getElement().show();
    }
    this.reset();
    this._element = this._element.detach();
};

EditCommentForm.prototype.createDom = function(){
    this._element = $('<form></form>');
    this._element.attr('class', 'post-comments');

    var div = $('<div></div>');
    this._textarea = $('<textarea></textarea>');
    this._textarea.attr('id', this._id);

    /*
    this._help_text = $('<span></span>').attr('class', 'help-text');
    this._help_text.html(gettext('Markdown is allowed in the comments'));
    div.append(this._help_text);

    this._help_text = $('<div></div>').attr('class', 'clearfix');
    div.append(this._help_text);
    */

    this._element.append(div);
    div.append(this._textarea);
    this._text_counter = $('<span></span>').attr('class', 'counter');
    div.append(this._text_counter);
    this._submit_btn = $('<button class="submit small"></button>');
    div.append(this._submit_btn);
    this._cancel_btn = $('<button class="submit small"></button>');
    this._cancel_btn.html(gettext('cancel'));
    div.append(this._cancel_btn);

    setupButtonEventHandlers(this._submit_btn, this.getSaveHandler());
    setupButtonEventHandlers(this._cancel_btn, this.getCancelHandler());

    var update_counter = this.getCounterUpdater();
    var escape_handler = makeKeyHandler(27, this.getCancelHandler());
    this._textarea.attr('name', 'comment')
            .attr('cols', 60)
            .attr('rows', 5)
            .attr('maxlength', maxCommentLength)
            .blur(update_counter)
            .focus(update_counter)
            .keyup(update_counter)
            .keyup(escape_handler);
    if (askbot['settings']['saveCommentOnEnter']){
        var save_handler = makeKeyHandler(13, this.getSaveHandler());
        this._textarea.keydown(save_handler);
    }
    this._textarea.val(this._text);
};

EditCommentForm.prototype.isEnabled = function() {
    return (this._submit_btn.attr('disabled') !== 'disabled');//confusing! setters use boolean
};

EditCommentForm.prototype.enableForm = function() {
    this._submit_btn.attr('disabled', false);
    this._cancel_btn.attr('disabled', false);
};

EditCommentForm.prototype.disableForm = function() {
    this._submit_btn.attr('disabled', true);
    this._cancel_btn.attr('disabled', true);
};

EditCommentForm.prototype.reset = function(){
    this._comment = null;
    this._text = '';
    this._textarea.val('');
    this.enableForm();
};

EditCommentForm.prototype.confirmAbandon = function(){
    this.focus(true);
    this._textarea.addClass('highlight');
    var answer = confirm(gettext("Are you sure you don't want to post this comment?"));
    this._textarea.removeClass('highlight');
    return answer;
};

EditCommentForm.prototype.focus = function(hard){
    this._textarea.focus();
    if (hard === true){
        $(this._textarea).scrollTop();
    }
};

EditCommentForm.prototype.getSaveHandler = function(){

    var me = this;
    return function(){
        if (me.isEnabled() === false) {//prevent double submits
            return false;
        }
        var text = me._textarea.val();
        if (text.length < 10){
            me.focus();
            return false;
        }

        var post_data = {
            comment: text
        };

        if (me._type == 'edit'){
            post_data['comment_id'] = me._comment.getId();
            post_url = askbot['urls']['editComment'];
        }
        else {
            post_data['post_type'] = me._comment.getParentType();
            post_data['post_id'] = me._comment.getParentId();
            post_url = askbot['urls']['postComments'];
        }

        me.disableForm();

        $.ajax({
            type: "POST",
            url: post_url,
            dataType: "json",
            data: post_data,
            success: function(json) {
                //type is 'edit' or 'add'
                if (me._type == 'add'){
                    me._comment.dispose();
                    me._comment.getContainerWidget().reRenderComments(json);
                }
                else {
                    me._comment.setContent(json);
                    me._comment.getElement().show();
                }
                me.detach();
            },
            error: function(xhr, textStatus, errorThrown) {
                me._comment.getElement().show();
                showMessage(me._comment.getElement(), xhr.responseText, 'after');
                me.detach();
                me.enableForm();
            }
        });
        return false;
    };
};

//a single instance to reuse
var editCommentForm = new EditCommentForm();

var Comment = function(widget, data){
    WrappedElement.call(this);
    this._container_widget = widget;
    this._data = data || {};
    this._blank = true;//set to false by setContent
    this._element = null;
    this._is_convertible = askbot['data']['userIsAdminOrMod'];
    this.convert_link = null;
    this._delete_prompt = gettext('delete this comment');
    if (data && data['is_deletable']){
        this._deletable = data['is_deletable'];
    }
    else {
        this._deletable = false;
    }
    if (data && data['is_editable']){
        this._editable = data['is_deletable'];
    }
    else {
        this._editable = false;
    }
};
inherits(Comment, WrappedElement);

Comment.prototype.decorate = function(element){
    this._element = $(element);
    var parent_type = this._element.parent().parent().attr('id').split('-')[2];
    var comment_id = this._element.attr('id').replace('comment-','');
    this._data = {id: comment_id};
    var delete_img = this._element.find('span.delete-icon');
    if (delete_img.length > 0){
        this._deletable = true;
        this._delete_icon = new DeleteIcon(this.deletePrompt);
        this._delete_icon.setHandler(this.getDeleteHandler());
        this._delete_icon.decorate(delete_img);
    }
    var edit_link = this._element.find('a.edit');
    if (edit_link.length > 0){
        this._editable = true;
        this._edit_link = new EditLink();
        this._edit_link.setHandler(this.getEditHandler());
        this._edit_link.decorate(edit_link);
    }

    var convert_link = this._element.find('form.convert-comment');
    if (this._is_convertible){
        this._convert_link = new CommentConvertLink(comment_id); 
        this._convert_link.decorate(convert_link);
    }

    var vote = new CommentVoteButton(this);
    vote.decorate(this._element.find('.comment-votes .upvote'));

    this._blank = false;
};

Comment.prototype.isBlank = function(){
    return this._blank;
};

Comment.prototype.getId = function(){
    return this._data['id'];
};

Comment.prototype.hasContent = function(){
    return ('id' in this._data);
    //shortcut for 'user_url' 'html' 'user_display_name' 'comment_age'
};

Comment.prototype.hasText = function(){
    return ('text' in this._data);
}

Comment.prototype.getContainerWidget = function(){
    return this._container_widget;
};

Comment.prototype.getParentType = function(){
    return this._container_widget.getPostType();
};

Comment.prototype.getParentId = function(){
    return this._container_widget.getPostId();
};

Comment.prototype.setContent = function(data){
    this._data = data || this._data;
    this._element.html('');
    this._element.attr('class', 'comment');
    this._element.attr('id', 'comment-' + this._data['id']);

    var votes = this.makeElement('div');
    votes.addClass('comment-votes');

    var vote = new CommentVoteButton(this);
    if (this._data['upvoted_by_user']){
        vote.setVoted(true);
    }
    vote.setScore(this._data['score']);
    votes.append(vote.getElement());

    this._element.append(votes);

    this._comment_delete = $('<div class="comment-delete"></div>');
    if (this._deletable){
        this._delete_icon = new DeleteIcon(this._delete_prompt);
        this._delete_icon.setHandler(this.getDeleteHandler());
        this._comment_delete.append(this._delete_icon.getElement());
    }
    this._element.append(this._comment_delete);

    this._comment_body = $('<div class="comment-body"></div>');
    this._comment_body.html(this._data['html']);
    //this._comment_body.append(' &ndash; ');

    this._user_link = $('<a></a>').attr('class', 'author');
    this._user_link.attr('href', this._data['user_url']);
    this._user_link.html(this._data['user_display_name']);
    this._comment_body.append(' ');
    this._comment_body.append(this._user_link);

    this._comment_body.append(' (');
    this._comment_added_at = $('<abbr class="timeago"></abbr>');
    this._comment_added_at.html(this._data['comment_added_at']);
    this._comment_added_at.attr('title', this._data['comment_added_at']);
    this._comment_added_at.timeago();
    this._comment_body.append(this._comment_added_at);
    this._comment_body.append(')');

    if (this._editable){
        this._edit_link = new EditLink();
        this._edit_link.setHandler(this.getEditHandler())
        this._comment_body.append(this._edit_link.getElement());
    }

    if (this._is_convertible){
        this._convert_link = new CommentConvertLink(this._data['id']); 
        this._comment_body.append(this._convert_link.getElement());
    }
    this._element.append(this._comment_body);

    this._blank = false;
};

Comment.prototype.dispose = function(){
    if (this._comment_body){
        this._comment_body.remove();
    }
    if (this._comment_delete){
        this._comment_delete.remove();
    }
    if (this._user_link){
        this._user_link.remove();
    }
    if (this._comment_added_at){
        this._comment_added_at.remove();
    }
    if (this._delete_icon){
        this._delete_icon.dispose();
    }
    if (this._edit_link){
        this._edit_link.dispose();
    }
    if (this._convert_link){
        this._convert_link.dispose();
    }
    this._data = null;
    Comment.superClass_.dispose.call(this);
};

Comment.prototype.getElement = function(){
    Comment.superClass_.getElement.call(this);
    if (this.isBlank() && this.hasContent()){
        this.setContent();
        if (enableMathJax === true){
            MathJax.Hub.Queue(['Typeset', MathJax.Hub]);
        }
    }
    return this._element;
};

Comment.prototype.loadText = function(on_load_handler){
    var me = this;
    $.ajax({
        type: "GET",
        url: askbot['urls']['getComment'],
        data: {id: this._data['id']},
        success: function(json){
            me._data['text'] = json['text'];
            on_load_handler()
        },
        error: function(xhr, textStatus, exception) {
            showMessage(me.getElement(), xhr.responseText, 'after');
        }
    });
};

Comment.prototype.getText = function(){
    if (!this.isBlank()){
        if ('text' in this._data){
            return this._data['text'];
        }
    }
    return '';
}

Comment.prototype.getEditHandler = function(){
    var comment = this;
    return function(){
        if (editCommentForm.canCancel()){
            editCommentForm.detach();
            if (comment.hasText()){
                editCommentForm.attachTo(comment, 'edit');
            }
            else {
                comment.loadText(
                    function(){
                        editCommentForm.attachTo(comment, 'edit');
                    }
                );
            }
        }
    };
};

Comment.prototype.getDeleteHandler = function(){
    var comment = this;
    var del_icon = this._delete_icon;
    return function(){
        if (confirm(gettext('confirm delete comment'))){
            comment.getElement().hide();
            $.ajax({
                type: 'POST',
                url: askbot['urls']['deleteComment'],
                data: { comment_id: comment.getId() },
                success: function(json, textStatus, xhr) {
                    comment.dispose();
                },
                error: function(xhr, textStatus, exception) {
                    comment.getElement().show()
                    showMessage(del_icon.getElement(), xhr.responseText);
                },
                dataType: "json"
            });
        }
    };
};

var PostCommentsWidget = function(){
    WrappedElement.call(this);
    this._denied = false;
};
inherits(PostCommentsWidget, WrappedElement);

PostCommentsWidget.prototype.decorate = function(element){
    var element = $(element);
    this._element = element;

    var widget_id = element.attr('id');
    var id_bits = widget_id.split('-');
    this._post_id = id_bits[3];
    this._post_type = id_bits[2];
    this._is_truncated = askbot['data'][widget_id]['truncated'];
    this._user_can_post = askbot['data'][widget_id]['can_post'];

    //see if user can comment here
    var controls = element.find('.controls');
    this._activate_button = controls.find('.button');

    if (this._user_can_post == false){
        setupButtonEventHandlers(
            this._activate_button,
            this.getReadOnlyLoadHandler()
        );
    }
    else {
        setupButtonEventHandlers(
            this._activate_button,
            this.getActivateHandler()
        );
    }

    this._cbox = element.find('.content');
    var comments = new Array();
    var me = this;
    this._cbox.children('.comment').each(function(index, element){
        var comment = new Comment(me);
        comments.push(comment)
        comment.decorate(element);
    });
    this._comments = comments;
};

PostCommentsWidget.prototype.getPostType = function(){
    return this._post_type;
};

PostCommentsWidget.prototype.getPostId = function(){
    return this._post_id;
};

PostCommentsWidget.prototype.hideButton = function(){
    this._activate_button.hide();
};

PostCommentsWidget.prototype.showButton = function(){
    if (this._is_truncated === false){
        this._activate_button.html(askbot['messages']['addComment']);
    }
    this._activate_button.show();
}

PostCommentsWidget.prototype.startNewComment = function(){
    var comment = new Comment(this);
    this._cbox.append(comment.getElement());
    editCommentForm.attachTo(comment, 'add');
};

PostCommentsWidget.prototype.needToReload = function(){
    return this._is_truncated;
};

PostCommentsWidget.prototype.getActivateHandler = function(){
    var me = this;
    return function() {
        if (editCommentForm.canCancel()){
            editCommentForm.detach();
            if (me.needToReload()){
                me.reloadAllComments(function(json){
                    me.reRenderComments(json);
                    me.startNewComment();
                });
            }
            else {
                me.startNewComment();
            }
        }
    };
};

PostCommentsWidget.prototype.getReadOnlyLoadHandler = function(){
    var me = this;
    return function(){
        me.reloadAllComments(function(json){
            me.reRenderComments(json);
            me._activate_button.remove();
        });
    };
};


PostCommentsWidget.prototype.reloadAllComments = function(callback){
    var post_data = {post_id: this._post_id, post_type: this._post_type};
    var me = this;
    $.ajax({
        type: "GET",
        url: askbot['urls']['postComments'],
        data: post_data,
        success: function(json){
            callback(json);
            me._is_truncated = false;
        },
        dataType: "json"
    });
};

PostCommentsWidget.prototype.reRenderComments = function(json){
    $.each(this._comments, function(i, item){
        item.dispose();
    });
    this._comments = new Array();
    var me = this;
    $.each(json, function(i, item){
        var comment = new Comment(me, item);
        me._cbox.append(comment.getElement());
        me._comments.push(comment);
    });
};


var socialSharing = function(){

    var SERVICE_DATA = {
        //url - template for the sharing service url, params are for the popup
        identica: {
            url: "http://identi.ca/notice/new?status_textarea={TEXT}%20{URL}",
            params: "width=820, height=526,toolbar=1,status=1,resizable=1,scrollbars=1"
        },
        twitter: {
            url: "http://twitter.com/share?url={URL}&ref=twitbtn&text={TEXT}",
            params: "width=820,height=526,toolbar=1,status=1,resizable=1,scrollbars=1"
        },
        facebook: {
            url: "http://www.facebook.com/sharer.php?u={URL}&ref=fbshare&t={TEXT}",
            params: "width=630,height=436,toolbar=1,status=1,resizable=1,scrollbars=1"
        },
        linkedin: {
            url: "http://www.linkedin.com/shareArticle?mini=true&url={URL}&title={TEXT}",
            params: "width=630,height=436,toolbar=1,status=1,resizable=1,scrollbars=1"
        }
    };
    var URL = "";
    var TEXT = "";

    var share_page = function(service_name){
        if (SERVICE_DATA[service_name]){
            var url = SERVICE_DATA[service_name]['url'];
            url = url.replace('{TEXT}', TEXT);
            url = url.replace('{URL}', URL);
            var params = SERVICE_DATA[service_name]['params'];
            debugger;
            if(!window.open(url, "sharing", params)){
                window.location.href=url;
            }
            return false;
            //@todo: change to some other url shortening service
            $.ajax({
                url: "http://json-tinyurl.appspot.com/?&callback=?",
                dataType: "json",
                data: {'url':URL},
                success: function(data) {
                    url = url.replace('{URL}', data.tinyurl);
                },
                error: function(xhr, opts, error) {
                    debugger;
                    url = url.replace('{URL}', URL);
                },
                complete: function(data) {
                    debugger;
                    url = url.replace('{TEXT}', TEXT);
                    var params = SERVICE_DATA[service_name]['params'];
                    if(!window.open(url, "sharing", params)){
                        window.location.href=url;
                    }
                }
            });
        }
    }

    return {
        init: function(){
            URL = window.location.href;
            var urlBits = URL.split('/');
            URL = urlBits.slice(0, -2).join('/') + '/';
            TEXT = escape($('h1 > a').html());
            var hashtag = encodeURIComponent(
                                askbot['settings']['sharingSuffixText']
                            );
            TEXT = TEXT.substr(0, 134 - URL.length - hashtag.length);
            TEXT = TEXT + '... ' + hashtag;
            var fb = $('a.facebook-share')
            var tw = $('a.twitter-share');
            var ln = $('a.linkedin-share');
            var ica = $('a.identica-share');
            copyAltToTitle(fb);
            copyAltToTitle(tw);
            copyAltToTitle(ln);
            copyAltToTitle(ica);
            setupButtonEventHandlers(fb, function(){ share_page("facebook") });
            setupButtonEventHandlers(tw, function(){ share_page("twitter") });
            setupButtonEventHandlers(ln, function(){ share_page("linkedin") });
            setupButtonEventHandlers(ica, function(){ share_page("identica") });
        }
    }
}();

/**
 * @constructor
 * @extends {SimpleControl}
 */
var QASwapper = function(){
    SimpleControl.call(this);
    this._ans_id = null;
};
inherits(QASwapper, SimpleControl);

QASwapper.prototype.decorate = function(element){
    this._element = element;
    this._ans_id = parseInt(element.attr('id').split('-').pop());
    var me = this;
    this.setHandler(function(){
        me.startSwapping();
    });
};

QASwapper.prototype.startSwapping = function(){
    while (true){
        var title = prompt(gettext('Please enter question title (>10 characters)'));
        if (title.length >= 10){
            var data = {new_title: title, answer_id: this._ans_id};
            $.ajax({
                type: "POST",
                cache: false,
                dataType: "json",
                url: askbot['urls']['swap_question_with_answer'],
                data: data,
                success: function(data){
                    window.location.href = data['question_url'];
                }
            });
            break;
        }
    }
};

/**
 * @constructor
 */
var WMD = function(){
    WrappedElement.call(this);
    this._text = undefined;
    this._enabled_buttons = 'bold italic link blockquote code ' +
        'image attachment ol ul heading hr';
    this._is_previewer_enabled = true;
};
inherits(WMD, WrappedElement);

WMD.prototype.setEnabledButtons = function(buttons){
    this._enabled_buttons = buttons;
};

WMD.prototype.setPreviewerEnabled = function(state){
    this._is_previewer_enabled = state;
    if (this._previewer){
        this._previewer.hide();
    }
};

WMD.prototype.createDom = function(){
    this._element = this.makeElement('div');
    var clearfix = this.makeElement('div').addClass('clearfix');
    this._element.append(clearfix);

    var wmd_container = this.makeElement('div');
    wmd_container.addClass('wmd-container');
    this._element.append(wmd_container);

    var wmd_buttons = this.makeElement('div')
                        .attr('id', 'wmd-button-bar')
                        .addClass('wmd-panel');
    wmd_container.append(wmd_buttons);

    var editor = this.makeElement('textarea')
                        .attr('id', 'editor');
    wmd_container.append(editor);
    this._textarea = editor;

    if (this._markdown){
        editor.val(this._markdown);
    }

    var previewer = this.makeElement('div')
                        .attr('id', 'previewer')
                        .addClass('wmd-preview');
    wmd_container.append(previewer);
    this._previewer = previewer;
    if (this._is_previewer_enabled === false) {
        previewer.hide();
    }
};

WMD.prototype.setText = function(text){
    this._markdown = text;
    if (this._textarea){
        this._textarea.val(text);
    }
};

WMD.prototype.getText = function(){
    return this._textarea.val();
};

WMD.prototype.start = function(){
    Attacklab.Util.startEditor(true, this._enabled_buttons);
};

/**
 * @constructor
 */
var TinyMCE = function(config) {
    WrappedElement.call(this);
    this._config = config || {};
};
inherits(TinyMCE, WrappedElement);

/* 3 dummy functions to match WMD api */
TinyMCE.prototype.setEnabledButtons = function() {};
TinyMCE.prototype.start = function() {
    this.loadEditor();
};
TinyMCE.prototype.setPreviewerEnabled = function() {};

TinyMCE.prototype.setText = function(text) {
    this._text = text;
};

TinyMCE.prototype.getText = function() {
    return tinyMCE.activeEditor.getContent();
};

TinyMCE.prototype.loadEditor = function() {
    var config = JSON.stringify(this._config);
    var data = {config: config};
    var editorBox = this._element;
    var me = this;
    $.ajax({
        async: false,
        type: 'GET',
        dataType: 'json',
        cache: false,
        url: askbot['urls']['getEditor'],
        data: data,
        success: function(data) {
            if (data['success']) {
                editorBox.html(data['html']);
                editorBox.find('textarea').val(me._text);//@todo: fixme
                $.each(data['scripts'], function(idx, scriptData) {
                    var scriptElement = me.makeElement('script');
                    scriptElement.attr('type', 'text/javascript');
                    if (scriptData['src']) {
                        scriptElement.attr('src', scriptData['src']);
                    }
                    if (scriptData['contents']) {
                        scriptElement.html(scriptData['contents']);
                    }
                    $('head').append(scriptElement);
                });
            }
        }
    });
};

TinyMCE.prototype.createDom = function() {
    var editorBox = this.makeElement('div');
    editorBox.addClass('wmd-container');
    this._element = editorBox;
};

/**
 * @constructor
 * @todo: change this to generic object description editor
 */
var TagWikiEditor = function(){
    WrappedElement.call(this);
    this._state = 'display';//'edit' or 'display'
    this._content_backup  = '';
    this._is_editor_loaded = false;
    this._enabled_editor_buttons = null;
    this._is_previewer_enabled = false;
};
inherits(TagWikiEditor, WrappedElement);

TagWikiEditor.prototype.backupContent = function(){
    this._content_backup = this._content_box.contents();
};

TagWikiEditor.prototype.setEnabledEditorButtons = function(buttons){
    this._enabled_editor_buttons = buttons;
};

TagWikiEditor.prototype.setPreviewerEnabled = function(state){
    this._is_previewer_enabled = state;
    if (this.isEditorLoaded()){
        this._editor.setPreviewerEnabled(this._is_previewer_enabled);
    }
};

TagWikiEditor.prototype.setContent = function(content){
    this._content_box.empty();
    this._content_box.append(content);
};

TagWikiEditor.prototype.setState = function(state){
    if (state === 'edit'){
        this._state = state;
        this._edit_btn.hide();
        this._cancel_btn.show();
        this._save_btn.show();
        this._cancel_sep.show();
    } else if (state === 'display'){
        this._state = state;
        this._edit_btn.show();
        this._cancel_btn.hide();
        this._cancel_sep.hide();
        this._save_btn.hide();
    }
};

TagWikiEditor.prototype.restoreContent = function(){
    var content_box = this._content_box;
    content_box.empty();
    $.each(this._content_backup, function(idx, element){
        content_box.append(element);
    });
};

TagWikiEditor.prototype.getTagId = function(){
    return this._tag_id;
};

TagWikiEditor.prototype.isEditorLoaded = function(){
    return this._is_editor_loaded;
};

TagWikiEditor.prototype.setEditorLoaded = function(){
    return this._is_editor_loaded = true;
};

/**
 * loads initial data for the editor input and activates
 * the editor
 */
TagWikiEditor.prototype.startActivatingEditor = function(){
    var editor = this._editor;
    var me = this;
    var data = {
        object_id: me.getTagId(),
        model_name: 'Group'
    };
    $.ajax({
        type: 'GET',
        url: askbot['urls']['load_object_description'],
        data: data,
        cache: false,
        success: function(data){
            me.backupContent();
            editor.setText(data);
            me.setContent(editor.getElement());
            me.setState('edit');
            if (me.isEditorLoaded() === false){
                editor.start();
                me.setEditorLoaded();
            }
        }
    });
};

TagWikiEditor.prototype.saveData = function(){
    var me = this;
    var text = this._editor.getText();
    var data = {
        object_id: me.getTagId(),
        model_name: 'Group',//todo: fixme
        text: text
    };
    $.ajax({
        type: 'POST',
        dataType: 'json',
        url: askbot['urls']['save_object_description'],
        data: data,
        cache: false,
        success: function(data){
            if (data['success']){
                me.setState('display');
                me.setContent(data['html']);
            } else {
                showMessage(me.getElement(), data['message']);
            }
        }
    });
};

TagWikiEditor.prototype.cancelEdit = function(){
    this.restoreContent(); 
    this.setState('display');
};

TagWikiEditor.prototype.decorate = function(element){
    //expect <div id='group-wiki-{{id}}'><div class="content"/><a class="edit"/></div>
    this._element = element;
    var edit_btn = element.find('.edit-description');
    this._edit_btn = edit_btn;

    //adding two buttons...
    var save_btn = this.makeElement('a');
    save_btn.html(gettext('save'));
    edit_btn.after(save_btn);
    save_btn.hide();
    this._save_btn = save_btn;

    var cancel_btn = this.makeElement('a');
    cancel_btn.html(gettext('cancel'));
    save_btn.after(cancel_btn);
    cancel_btn.hide();
    this._cancel_btn = cancel_btn;

    this._cancel_sep = $('<span> | </span>');
    cancel_btn.before(this._cancel_sep);
    this._cancel_sep.hide();

    this._content_box = element.find('.content');
    this._tag_id = element.attr('id').split('-').pop();

    var me = this;
    if (askbot['settings']['editorType'] === 'markdown') {
        var editor = new WMD();
    } else {
        var editor = new TinyMCE({//override defaults
            mode: 'exact',
            elements: 'editor',
            theme_advanced_buttons1: 'bold, italic, |, link, |, numlist, bullist',
            theme_advanced_buttons2: '',
            plugins: '',
            width: '200'
        });
    }
    if (this._enabled_editor_buttons){
        editor.setEnabledButtons(this._enabled_editor_buttons);
    }
    editor.setPreviewerEnabled(this._is_previewer_enabled);
    this._editor = editor;
    setupButtonEventHandlers(edit_btn, function(){ me.startActivatingEditor() });
    setupButtonEventHandlers(cancel_btn, function(){me.cancelEdit()});
    setupButtonEventHandlers(save_btn, function(){me.saveData()});
};

var ImageChanger = function(){
    WrappedElement.call(this);
    this._image_element = undefined;
    this._delete_button = undefined;
    this._save_url = undefined;
    this._delete_url = undefined;
    this._messages = undefined;
};
inherits(ImageChanger, WrappedElement);

ImageChanger.prototype.setImageElement = function(image_element){
    this._image_element = image_element;
};

ImageChanger.prototype.setMessages = function(messages){
    this._messages = messages;
};

ImageChanger.prototype.setDeleteButton = function(delete_button){
    this._delete_button = delete_button;
};

ImageChanger.prototype.setSaveUrl = function(url){
    this._save_url = url;
};

ImageChanger.prototype.setDeleteUrl = function(url){
    this._delete_url = url;
};

ImageChanger.prototype.setAjaxData = function(data){
    this._ajax_data = data;
};

ImageChanger.prototype.showImage = function(image_url){
    this._image_element.attr('src', image_url);
    this._image_element.show();
};

ImageChanger.prototype.deleteImage = function(){
    this._image_element.attr('src', '');
    this._image_element.css('display', 'none');

    var me = this;
    var delete_url = this._delete_url;
    var data = this._ajax_data;
    $.ajax({
        type: 'POST',
        dataType: 'json',
        url: delete_url,
        data: data,
        cache: false,
        success: function(data){
            if (data['success'] === true){
                showMessage(me.getElement(), data['message'], 'after');
            }
        }
    });
};

ImageChanger.prototype.saveImageUrl = function(image_url){
    var me = this;
    var data = this._ajax_data;
    data['image_url'] = image_url;
    var save_url = this._save_url;
    $.ajax({
        type: 'POST',
        dataType: 'json',
        url: save_url,
        data: data,
        cache: false,
        success: function(data){
            if (!data['success']){
                showMessage(me.getElement(), data['message'], 'after');
            }
        }
    });
};

ImageChanger.prototype.startDialog = function(){
    //reusing the wmd's file uploader
    var me = this;
    var change_image_text = this._messages['change_image'];
    var change_image_button = this._element;
    Attacklab.Util.prompt(
        "<h3>" + gettext('Enter the logo url or upload an image') + '</h3>',
        'http://',
        function(image_url){
            if (image_url){
                me.saveImageUrl(image_url);
                me.showImage(image_url);
                change_image_button.html(change_image_text);
                me.showDeleteButton();
            }
        },
        'image'
    );
};

ImageChanger.prototype.showDeleteButton = function(){
    this._delete_button.show();
    this._delete_button.prev().show();
};

ImageChanger.prototype.hideDeleteButton = function(){
    this._delete_button.hide();
    this._delete_button.prev().hide();
};


ImageChanger.prototype.startDeleting = function(){
    if (confirm(gettext('Do you really want to remove the image?'))){
        this.deleteImage();
        this._element.html(this._messages['add_image']);
        this.hideDeleteButton();
        this._delete_button.hide();
        var sep = this._delete_button.prev();
        sep.hide();
    };
};

/**
 * decorates an element that will serve as the image changer button
 */
ImageChanger.prototype.decorate = function(element){
    this._element = element;
    var me = this;
    setupButtonEventHandlers(
        element,
        function(){
            me.startDialog();
        }
    );
    setupButtonEventHandlers(
        this._delete_button,
        function(){
            me.startDeleting();
        }
    )
};

var UserGroupProfileEditor = function(){
    TagWikiEditor.call(this);
};
inherits(UserGroupProfileEditor, TagWikiEditor);

UserGroupProfileEditor.prototype.toggleEmailModeration = function(){
    var btn = this._moderate_email_btn;
    var group_id = this.getTagId();
    $.ajax({
        type: 'POST',
        dataType: 'json',
        cache: false,
        data: {group_id: group_id},
        url: askbot['urls']['toggle_group_email_moderation'],
        success: function(data){
            if (data['success']){
                btn.html(data['new_button_text']);
            } else {
                showMessage(btn, data['message']);
            }
        }
    });
};

UserGroupProfileEditor.prototype.decorate = function(element){
    this.setEnabledEditorButtons('bold italic link ol ul');
    this.setPreviewerEnabled(false);
    UserGroupProfileEditor.superClass_.decorate.call(this, element);
    var change_logo_btn = element.find('.change-logo');
    this._change_logo_btn = change_logo_btn;

    var moderate_email_toggle = new TwoStateToggle();
    moderate_email_toggle.setPostData({
        group_id: this.getTagId(),
        property_name: 'moderate_email'
    });
    var moderate_email_btn = element.find('#moderate-email');
    this._moderate_email_btn = moderate_email_btn;
    moderate_email_toggle.decorate(moderate_email_btn);

    var moderate_publishing_replies_toggle = new TwoStateToggle();
    moderate_publishing_replies_toggle.setPostData({
        group_id: this.getTagId(),
        property_name: 'moderate_answers_to_enquirers'
    });
    var btn = element.find('#moderate-answers-to-enquirers');
    moderate_publishing_replies_toggle.decorate(btn);

    var vip_toggle = new TwoStateToggle();
    vip_toggle.setPostData({
        group_id: this.getTagId(),
        property_name: 'is_vip'
    });
    var btn = element.find('#vip-toggle');
    vip_toggle.decorate(btn);

    var opennessSelector = new DropdownSelect();
    var selectorElement = element.find('#group-openness-selector');
    opennessSelector.setPostData({
        group_id: this.getTagId(),
        property_name: 'openness'
    });
    opennessSelector.decorate(selectorElement);

    var email_editor = new TextPropertyEditor();
    email_editor.decorate(element.find('#preapproved-emails'));

    var domain_editor = new TextPropertyEditor();
    domain_editor.decorate(element.find('#preapproved-email-domains'));

    var logo_changer = new ImageChanger();
    logo_changer.setImageElement(element.find('.group-logo'));
    logo_changer.setAjaxData({
        group_id: this.getTagId()
    });
    logo_changer.setSaveUrl(askbot['urls']['save_group_logo_url']);
    logo_changer.setDeleteUrl(askbot['urls']['delete_group_logo_url']);
    logo_changer.setMessages({
        change_image: gettext('change logo'),
        add_image: gettext('add logo')
    });
    var delete_logo_btn = element.find('.delete-logo');
    logo_changer.setDeleteButton(delete_logo_btn);
    logo_changer.decorate(change_logo_btn);
};

var GroupJoinButton = function(){
    TwoStateToggle.call(this);
};
inherits(GroupJoinButton, TwoStateToggle);

GroupJoinButton.prototype.getPostData = function(){
    return { group_id: this._group_id };
};

GroupJoinButton.prototype.getHandler = function(){
    var me = this;
    return function(){
        $.ajax({
            type: 'POST',
            dataType: 'json',
            cache: false,
            data: me.getPostData(),
            url: askbot['urls']['join_or_leave_group'],
            success: function(data){
                if (data['success']){
                    var level = data['membership_level'];
                    var new_state = 'off-state';
                    if (level == 'full' || level == 'pending') {
                        new_state = 'on-state';
                    }
                    me.setState(new_state);
                } else {
                    showMessage(me.getElement(), data['message']);
                }
            }
        });
    };
};
GroupJoinButton.prototype.decorate = function(elem) {
    GroupJoinButton.superClass_.decorate.call(this, elem);
    this._group_id = this._element.data('groupId');
};

var TagEditor = function() {
    WrappedElement.call(this);
    this._has_hot_backspace = false;
    this._settings = JSON.parse(askbot['settings']['tag_editor']);
};
inherits(TagEditor, WrappedElement);

TagEditor.prototype.getSelectedTags = function() {
    return $.trim(this._hidden_tags_input.val()).split(/\s+/);
};

TagEditor.prototype.setSelectedTags = function(tag_names) {
    this._hidden_tags_input.val($.trim(tag_names.join(' ')));
};

TagEditor.prototype.addSelectedTag = function(tag_name) {
    var tag_names = this._hidden_tags_input.val();
    this._hidden_tags_input.val(tag_names + ' ' + tag_name);
    $('.acResults').hide();//a hack to hide the autocompleter
};

TagEditor.prototype.isSelectedTagName = function(tag_name) {
    var tag_names = this.getSelectedTags();
    return $.inArray(tag_name, tag_names) != -1;
};

TagEditor.prototype.removeSelectedTag = function(tag_name) {
    var tag_names = this.getSelectedTags();
    var idx = $.inArray(tag_name, tag_names);
    if (idx !== -1) {
        tag_names.splice(idx, 1)
    }
    this.setSelectedTags(tag_names);
};

TagEditor.prototype.getTagDeleteHandler = function(tag){
    var me = this;
    return function(){
        me.removeSelectedTag(tag.getName());
        me.clearErrorMessage();
        tag.dispose();
        $('.acResults').hide();//a hack to hide the autocompleter
        me.fixHeight();
    };
};

TagEditor.prototype.cleanTag = function(tag_name, reject_dupe) {
    tag_name = $.trim(tag_name);
    tag_name = tag_name.replace(/\s+/, ' ');

    var force_lowercase = this._settings['force_lowercase_tags'];
    if (force_lowercase) {
        tag_name = tag_name.toLowerCase();
    }

    if (reject_dupe && this.isSelectedTagName(tag_name)) {
        throw interpolate(
            gettext('tag "%s" was already added, no need to repeat (press "escape" to delete)'),
            [tag_name]
        );
    }

    var max_tags = this._settings['max_tags_per_post'];
    if (this.getSelectedTags().length + 1 > max_tags) {//count current
        throw interpolate(
            ngettext(
                'a maximum of %s tag is allowed',
                'a maximum of %s tags are allowed',
                max_tags
            ),
            [max_tags]
        );
    }

    //generic cleaning
    return cleanTag(tag_name, this._settings);
};

TagEditor.prototype.addTag = function(tag_name) {
    var tag = new Tag();
    tag.setName(tag_name);
    tag.setDeletable(true);
    tag.setLinkable(true);
    tag.setDeleteHandler(this.getTagDeleteHandler(tag));
    this._tags_container.append(tag.getElement());
    this.addSelectedTag(tag_name);
};

TagEditor.prototype.immediateClearErrorMessage = function() {
    this._error_alert.html('');
    this._error_alert.show();
    //this._element.css('margin-top', '18px');//todo: the margin thing is a hack
}

TagEditor.prototype.clearErrorMessage = function(fade) {
    if (fade) {
        var me = this;
        this._error_alert.fadeOut(function(){
            me.immediateClearErrorMessage();
        });
    } else {
        this.immediateClearErrorMessage();
    }
};

TagEditor.prototype.setErrorMessage = function(text) {
    var old_text = this._error_alert.html();
    this._error_alert.html(text);
    if (old_text == '') {
        this._error_alert.hide();
        this._error_alert.fadeIn(100);
    }
    //this._element.css('margin-top', '0');//todo: remove this hack
};

TagEditor.prototype.getAddTagHandler = function() {
    var me = this;
    return function(tag_name) {
        if (me.isSelectedTagName(tag_name)) {
            return;
        }
        try {
            var clean_tag_name = me.cleanTag($.trim(tag_name));
            me.addTag(clean_tag_name);
            me.clearNewTagInput();
            me.fixHeight();
        } catch (error) {
            me.setErrorMessage(error);
            setTimeout(function(){
                me.clearErrorMessage(true);
            }, 1000);
        }
    };
};

TagEditor.prototype.getRawNewTagValue = function() {
    return this._visible_tags_input.val();//without trimming
};

TagEditor.prototype.clearNewTagInput = function() {
    return this._visible_tags_input.val('');
};

TagEditor.prototype.editLastTag = function() {
    //delete rendered tag
    var tc = this._tags_container;
    tc.find('li:last').remove();
    //remove from hidden tags input
    var tags = this.getSelectedTags();
    var last_tag = tags.pop();
    this.setSelectedTags(tags);
    //populate the tag editor
    this._visible_tags_input.val(last_tag);
    putCursorAtEnd(this._visible_tags_input);
};

TagEditor.prototype.setHotBackspace = function(is_hot) {
    this._has_hot_backspace = is_hot;
};

TagEditor.prototype.hasHotBackspace = function() {
    return this._has_hot_backspace;
};

TagEditor.prototype.completeTagInput = function(reject_dupe) {
    var tag_name = $.trim(this._visible_tags_input.val());
    try {
        tag_name = this.cleanTag(tag_name, reject_dupe);
        this.addTag(tag_name);
        this.clearNewTagInput();
    } catch (error) {
        this.setErrorMessage(error);
    }
};

TagEditor.prototype.saveHeight = function() {
    return;
    var elem = this._visible_tags_input;
    this._height = elem.offset().top;
};

TagEditor.prototype.fixHeight = function() {
    return;
    var new_height = this._visible_tags_input.offset().top;
    //@todo: replace this by real measurement
    var element_height = parseInt(
        this._element.css('height').replace('px', '')
    );
    if (new_height > this._height) {
        this._element.css('height', element_height + 28);//magic number!!!
    } else if (new_height < this._height) {
        this._element.css('height', element_height - 28);//magic number!!!
    }
    this.saveHeight();
};

TagEditor.prototype.closeAutoCompleter = function() {
    this._autocompleter.finish();
};

TagEditor.prototype.getTagInputKeyHandler = function() {
    var new_tags = this._visible_tags_input;
    var me = this;
    return function(e) {
        if (e.shiftKey) {
            return;
        }
        me.saveHeight();
        var key = e.which || e.keyCode;
        var text = me.getRawNewTagValue();

        //space 32, enter 13
        if (key == 32 || key == 13) {
            var tag_name = $.trim(text);
            if (tag_name.length > 0) {
                me.completeTagInput(true);//true for reject dupes
            }
            me.fixHeight();
            return false;
        }

        if (text == '') {
            me.clearErrorMessage();
            me.closeAutoCompleter();
        } else {
            try {
                /* do-nothing validation here
                 * just to report any errors while 
                 * the user is typing */
                me.cleanTag(text);
                me.clearErrorMessage();
            } catch (error) {
                me.setErrorMessage(error);
            }
        }
        
        //8 is backspace
        if (key == 8 && text.length == 0) {
            if (me.hasHotBackspace() === true) {
                me.editLastTag();
                me.setHotBackspace(false);
            } else {
                me.setHotBackspace(true);
            }
        }

        //27 is escape
        if (key == 27) {
            me.clearNewTagInput();
            me.clearErrorMessage();
        }

        if (key !== 8) {
            me.setHotBackspace(false);
        }
        me.fixHeight();
        return false;
    };
}

TagEditor.prototype.decorate = function(element) {
    this._element = element;
    this._hidden_tags_input = element.find('input[name="tags"]');//this one is hidden
    this._tags_container = element.find('ul.tags');
    this._error_alert = $('.tag-editor-error-alert > span');

    var me = this;
    this._tags_container.children().each(function(idx, elem){
        var tag = new Tag();
        tag.setDeletable(true);
        tag.setLinkable(false);
        tag.decorate($(elem));
        tag.setDeleteHandler(me.getTagDeleteHandler(tag));
    });

    var visible_tags_input = element.find('.new-tags-input');
    this._visible_tags_input = visible_tags_input;
    this.saveHeight();

    var me = this;
    var tagsAc = new AutoCompleter({
        url: askbot['urls']['get_tag_list'],
        onItemSelect: function(item){
            if (me.isSelectedTagName(item['value']) === false) {
                me.completeTagInput();
            } else {
                me.clearNewTagInput();
            }
        },
        preloadData: true,
        minChars: 1,
        useCache: true,
        matchInside: true,
        maxCacheLength: 100,
        delay: 10
    });
    tagsAc.decorate(visible_tags_input);
    this._autocompleter = tagsAc;
    visible_tags_input.keyup(this.getTagInputKeyHandler());

    element.click(function(e) {
        visible_tags_input.focus();
        return false;
    });
};

/**
 * @constructor
 * Category is a select box item
 * that has CategoryEditControls
 */
var Category = function() {
    SelectBoxItem.call(this);
    this._state = 'display';
    this._settings = JSON.parse(askbot['settings']['tag_editor']);
};
inherits(Category, SelectBoxItem);

Category.prototype.setCategoryTree = function(tree) {
    this._tree = tree;
};

Category.prototype.getCategoryTree = function() {
    return this._tree;
};

Category.prototype.getName = function() {
    return this.getContent().getContent();
};

Category.prototype.getPath = function() {
    return this._tree.getPathToItem(this);
};

Category.prototype.setState = function(state) {
    this._state = state;
    if ( !this._element ) {
        return;
    }
    this._input_box.val('');
    if (state === 'display') {
        this.showContent();
        this.hideEditor();
        this.hideEditControls();
    } else if (state === 'editable') {
        this._tree._state = 'editable';//a hack
        this.showContent();
        this.hideEditor();
        this.showEditControls();
    } else if (state === 'editing') {
        this._prev_tree_state = this._tree.getState();
        this._tree._state = 'editing';//a hack
        this._input_box.val(this.getName());
        this.hideContent();
        this.showEditor();
        this.hideEditControls();
    }
};

Category.prototype.hideEditControls = function() {
    this._delete_button.hide();
    this._edit_button.hide();
    this._element.unbind('mouseenter mouseleave');
};

Category.prototype.showEditControls = function() {
    var del = this._delete_button;
    var edit = this._edit_button;
    this._element.hover(
        function(){
            del.show();
            edit.show();
        },
        function(){
            del.hide();
            edit.hide();
        }
    );
};

Category.prototype.showEditControlsNow = function() {
    this._delete_button.show();
    this._edit_button.show();
};

Category.prototype.hideContent = function() {
    this.getContent().getElement().hide();
};

Category.prototype.showContent = function() {
    this.getContent().getElement().show();
};

Category.prototype.showEditor = function() {
    this._input_box.show();
    this._input_box.focus();
    this._save_button.show();
    this._cancel_button.show();
};

Category.prototype.hideEditor = function() {
    this._input_box.hide();
    this._save_button.hide();
    this._cancel_button.hide();
};

Category.prototype.getInput = function() {
    return this._input_box.val();
};

Category.prototype.getDeleteHandler = function() {
    var me = this;
    return function() {
        if (confirm(gettext('Delete category?'))) {
            var tree = me.getCategoryTree();
            $.ajax({
                type: 'POST',
                dataType: 'json',
                data: JSON.stringify({
                    tag_name: me.getName(),
                    path: me.getPath()
                }),
                cache: false,
                url: askbot['urls']['delete_tag'],
                success: function(data) {
                    if (data['success']) {
                        //rebuild category tree based on data
                        tree.setData(data['tree_data']);
                        //re-open current branch
                        tree.selectPath(tree.getCurrentPath());
                        tree.setState('editable');
                    } else {
                        alert(data['message']);
                    }
                }
            });
        }
        return false;
    };
};

Category.prototype.getSaveHandler = function() {
    var me = this;
    var settings = this._settings;
    //here we need old value and new value
    return function(){
        var to_name = me.getInput();
        try {
            to_name = cleanTag(to_name, settings);
            var data = {
                from_name: me.getOriginalName(),
                to_name: to_name,
                path: me.getPath()
            };
            $.ajax({
                type: 'POST',
                dataType: 'json',
                data: JSON.stringify(data),
                cache: false,
                url: askbot['urls']['rename_tag'],
                success: function(data) {
                    if (data['success']) {
                        me.setName(to_name);
                        me.setState('editable');
                        me.showEditControlsNow();
                    } else {
                        alert(data['message']);
                    }
                }
            });
        } catch (error) {
            alert(error);
        }
        return false;
    };
};

Category.prototype.addControls = function() {
    var input_box = this.makeElement('input');
    this._input_box = input_box;
    this._element.append(input_box);

    var save_button = this.makeButton(
        gettext('save'),
        this.getSaveHandler()
    );
    this._save_button = save_button;
    this._element.append(save_button);

    var me = this;
    var cancel_button = this.makeButton(
        'x',
        function(){
            me.setState('editable');
            me.showEditControlsNow();
            return false;
        }
    );
    this._cancel_button = cancel_button;
    this._element.append(cancel_button);

    var edit_button = this.makeButton(
        gettext('edit'),
        function(){ 
            //todo: I would like to make only one at a time editable
            //var tree = me.getCategoryTree();
            //tree.closeAllEditors();
            //tree.setState('editable');
            //calc path, then select it
            var tree = me.getCategoryTree();
            tree.selectPath(me.getPath());
            me.setState('editing');
            return false;
        }
    );
    this._edit_button = edit_button;
    this._element.append(edit_button);

    var delete_button = this.makeButton(
        'x', this.getDeleteHandler()
    );
    this._delete_button = delete_button;
    this._element.append(delete_button);
};

Category.prototype.getOriginalName = function() {
    return this._original_name;
};

Category.prototype.createDom = function() {
    Category.superClass_.createDom.call(this);
    this.addControls();
    this.setState('display');
    this._original_name = this.getName();
};

Category.prototype.decorate = function(element) {
    Category.superClass_.decorate.call(this, element);
    this.addControls();
    this.setState('display');
    this._original_name = this.getName();
};

var CategoryAdder = function() {
    WrappedElement.call(this);
    this._state = 'disabled';//waitedit
    this._tree = undefined;//category tree
    this._settings = JSON.parse(askbot['settings']['tag_editor']);
};
inherits(CategoryAdder, WrappedElement);

CategoryAdder.prototype.setCategoryTree = function(tree) {
    this._tree = tree;
};

CategoryAdder.prototype.setLevel = function(level) {
    this._level = level;
};

CategoryAdder.prototype.setState = function(state) {
    this._state = state;
    if (!this._element) {
        return;
    }
    if (state === 'waiting') {
        this._element.show();
        this._input.val('');
        this._input.hide();
        this._save_button.hide();
        this._cancel_button.hide();
        this._trigger.show();
    } else if (state === 'editable') {
        this._element.show();
        this._input.show();
        this._input.val('');
        this._input.focus();
        this._save_button.show();
        this._cancel_button.show();
        this._trigger.hide();
    } else if (state === 'disabled') {
        this.setState('waiting');//a little hack
        this._state = 'disabled';
        this._element.hide();
    }
};

CategoryAdder.prototype.cleanCategoryName = function(name) {
    name = $.trim(name);
    if (name === '') {
        throw gettext('category name cannot be empty');
    }
    //if ( this._tree.hasCategory(name) ) {
        //throw interpolate(
        //throw gettext('this category already exists');
        //    [this._tree.getDisplayPathByName(name)]
        //)
    //}
    return cleanTag(name, this._settings);
};

CategoryAdder.prototype.getPath = function() {
    var path = this._tree.getCurrentPath();
    if (path.length > this._level + 1) {
        return path.slice(0, this._level + 1);
    } else {
        return path;
    }
};

CategoryAdder.prototype.getSelectBox = function() {
    return this._tree.getSelectBox(this._level);
};

CategoryAdder.prototype.startAdding = function() {
    try {
        var name = this._input.val();
        name = this.cleanCategoryName(name);
    } catch (error) {
        alert(error);
        return;
    }

    //don't add dupes to the same level
    var existing_names = this.getSelectBox().getNames();
    if ($.inArray(name, existing_names) != -1) {
        alert(gettext('already exists at the current level!'));
        return;
    }

    var me = this;
    var tree = this._tree;
    var adder_path = this.getPath();

    $.ajax({
        type: 'POST',
        dataType: 'json',
        data: JSON.stringify({
            path: adder_path,
            new_category_name: name
        }),
        url: askbot['urls']['add_tag_category'],
        cache: false,
        success: function(data) {
            if (data['success']) {
                //rebuild category tree based on data
                tree.setData(data['tree_data']);
                tree.selectPath(data['new_path']);
                tree.setState('editable');
                me.setState('waiting');
            } else {
                alert(data['message']);
            }
        }
    });
};

CategoryAdder.prototype.createDom = function() {
    this._element = this.makeElement('li');
    //add open adder link
    var trigger = this.makeElement('a');
    this._trigger = trigger;
    trigger.html(gettext('add category'));
    this._element.append(trigger);
    //add input box and the add button
    var input = this.makeElement('input');
    this._input = input;
    input.addClass('add-category');
    input.attr('name', 'add_category');
    this._element.append(input);
    //add save category button
    var save_button = this.makeElement('button');
    this._save_button = save_button;
    save_button.html(gettext('save'));
    this._element.append(save_button);

    var cancel_button = this.makeElement('button');
    this._cancel_button = cancel_button;
    cancel_button.html('x');
    this._element.append(cancel_button);

    this.setState(this._state);

    var me = this;
    setupButtonEventHandlers(
        trigger,
        function(){ me.setState('editable'); }
    )
    setupButtonEventHandlers(
        save_button,
        function() { 
            me.startAdding();
            return false;//prevent form submit
        }
    );
    setupButtonEventHandlers(
        cancel_button,
        function() {
            me.setState('waiting');
            return false;//prevent submit
        }
    );
    //create input box, button and the "activate" link
};

/**
 * @constructor
 * SelectBox subclass to create/edit/delete
 * categories
 */
var CategorySelectBox = function() {
    SelectBox.call(this);
    this._item_class = Category;
    this._category_adder = undefined;
    this._tree = undefined;//cat tree
    this._level = undefined;
};
inherits(CategorySelectBox, SelectBox);

CategorySelectBox.prototype.setState = function(state) {
    this._state = state;
    if (state === 'select') {
        if (this._category_adder) {
            this._category_adder.setState('disabled');
        }
        $.each(this._items, function(idx, item){
            item.setState('display');
        });
    } else if (state === 'editable') {
        this._category_adder.setState('waiting');
        $.each(this._items, function(idx, item){
            item.setState('editable');
        });
    }
};

CategorySelectBox.prototype.setCategoryTree = function(tree) {
    this._tree = tree;
};

CategorySelectBox.prototype.getCategoryTree = function() {
};

CategorySelectBox.prototype.setLevel = function(level) {
    this._level = level;
};

CategorySelectBox.prototype.getNames = function() {
    var names = [];
    $.each(this._items, function(idx, item) {
        names.push(item.getName());
    });
    return names;
};

CategorySelectBox.prototype.appendCategoryAdder = function() {
    var adder = new CategoryAdder();
    adder.setLevel(this._level);
    adder.setCategoryTree(this._tree);
    this._category_adder = adder;
    this._element.append(adder.getElement());
};

CategorySelectBox.prototype.createDom = function() {
    CategorySelectBox.superClass_.createDom();
    if (askbot['data']['userIsAdmin']) {
        this.appendCategoryAdder();
    }
};

CategorySelectBox.prototype.decorate = function(element) {
    CategorySelectBox.superClass_.decorate.call(this, element);
    this.setState(this._state);
    if (askbot['data']['userIsAdmin']) {
        this.appendCategoryAdder();
    }
};

/**
 * @constructor
 * turns on/off the category editor
 */
var CategoryEditorToggle = function() {
    TwoStateToggle.call(this);
};
inherits(CategoryEditorToggle, TwoStateToggle);

CategoryEditorToggle.prototype.setCategorySelector = function(sel) {
    this._category_selector = sel;
};

CategoryEditorToggle.prototype.getCategorySelector = function() {
    return this._category_selector;
};

CategoryEditorToggle.prototype.decorate = function(element) {
    CategoryEditorToggle.superClass_.decorate.call(this, element);
};

CategoryEditorToggle.prototype.getDefaultHandler = function() {
    var me = this;
    return function() {
        var editor = me.getCategorySelector();
        if (me.isOn()) {
            me.setState('off-state');
            editor.setState('select');
        } else {
            me.setState('on-state');
            editor.setState('editable');
        }
    };
};

var CategorySelector = function() {
    Widget.call(this);
    this._data = null;
    this._select_handler = function(){};//dummy default
    this._current_path = [0];//path points to selected item in tree
};
inherits(CategorySelector, Widget);

/**
 * propagates state to the individual selectors
 */
CategorySelector.prototype.setState = function(state) {
    this._state = state;
    if (state === 'editing') {
        return;//do not propagate this state
    }
    $.each(this._selectors, function(idx, selector){
        selector.setState(state);
    });
};

CategorySelector.prototype.getPathToItem = function(item) {
    function findPathToItemInTree(tree, item) {
        for (var i = 0; i < tree.length; i++) {
            var node = tree[i];
            if (node[2] === item) {
                return [i];
            }
            var path = findPathToItemInTree(node[1], item);
            if (path.length > 0) {
                path.unshift(i);
                return path;
            }
        }
        return [];
    };
    return findPathToItemInTree(this._data, item);
};

CategorySelector.prototype.applyToDataItems = function(func) {
    function applyToDataItems(tree) {
        $.each(tree, function(idx, item) {
            func(item);
            applyToDataItems(item[1]);
        });
    };
    if (this._data) {
        applyToDataItems(this._data);
    }
};

CategorySelector.prototype.setData = function(data) {
    this._clearData
    this._data = data;
    var tree = this;
    function attachCategory(item) {
        var cat = new Category();
        cat.setName(item[0]);
        cat.setCategoryTree(tree);
        item[2] = cat;
    };
    this.applyToDataItems(attachCategory);
};

/**
 * clears contents of selector boxes starting from
 * the given level, in range 0..2
 */
CategorySelector.prototype.clearCategoryLevels = function(level) {
    for (var i = level; i < 3; i++) {
        this._selectors[i].detachAllItems();
    }
};

CategorySelector.prototype.getLeafItems = function(selection_path) {
    //traverse the tree down to items pointed to by the path
    var data = this._data[0];
    for (var i = 1; i < selection_path.length; i++) {
        data = data[1][selection_path[i]];
    }
    return data[1];
}

/**
 * called when a sub-level needs to open
 */
CategorySelector.prototype.populateCategoryLevel = function(source_path) {
    var level = source_path.length - 1;
    if (level >= 3) {
        return;
    }
    //clear all items downstream
    this.clearCategoryLevels(level);

    //populate current selector
    var selector = this._selectors[level];
    var items  = this.getLeafItems(source_path);

    $.each(items, function(idx, item) {
        var category_name = item[0];
        var category_subtree = item[1];
        var category_object = item[2];
        selector.addItemObject(category_object);
        if (category_subtree.length > 0) {
            category_object.addCssClass('tree');
        }
    });

    this.setState(this._state);//update state

    selector.clearSelection();
};

CategorySelector.prototype.selectPath = function(path) {
    for (var i = 1; i <= path.length; i++) {
        this.populateCategoryLevel(path.slice(0, i));
    }
    for (var i = 1; i < path.length; i++) {
        var sel_box = this._selectors[i-1];
        var category = sel_box.getItemByIndex(path[i]);
        sel_box.selectItem(category);
    }
};

CategorySelector.prototype.getSelectBox = function(level) {
    return this._selectors[level];
};

CategorySelector.prototype.getSelectedPath = function(selected_level) {
    var path = [0];//root, todo: better use names for path???
    /* 
     * upper limit capped by current clicked level
     * we ignore all selection above the current level
     */
    for (var i = 0; i < selected_level + 1; i++) {
        var selector = this._selectors[i];
        var item = selector.getSelectedItem();
        if (item) {
            path.push(selector.getItemIndex(item));
        } else {
            return path;
        }
    }
    return path;
};

/** getter and setter are not symmetric */
CategorySelector.prototype.setSelectHandler = function(handler) {
    this._select_handler = handler;
};

CategorySelector.prototype.getSelectHandlerInternal = function() {
    return this._select_handler;
};

CategorySelector.prototype.setCurrentPath = function(path) {
    return this._current_path = path;
};

CategorySelector.prototype.getCurrentPath = function() {
    return this._current_path;
};

CategorySelector.prototype.getEditorToggle = function() {
    return this._editor_toggle;
};

/*CategorySelector.prototype.closeAllEditors = function() {
    $.each(this._selectors, function(idx, sel) {
        sel._category_adder.setState('wait');
        $.each(sel._items, function(idx2, item) {
            item.setState('editable');
        });
    });
};*/

CategorySelector.prototype.getSelectHandler = function(level) {
    var me = this;
    return function(item_data) {
        if (me.getState() === 'editing') {
            return;//don't navigate when editing
        }
        //1) run the assigned select handler
        var tag_name = item_data['title']
        if (me.getState() === 'select') {
            /* this one will actually select the tag
             * maybe a bit too implicit
             */
            me.getSelectHandlerInternal()(tag_name);
        }
        //2) if appropriate, populate the higher level
        if (level < 2) {
            var current_path = me.getSelectedPath(level);
            me.setCurrentPath(current_path);
            me.populateCategoryLevel(current_path);
        }
    }
};

CategorySelector.prototype.decorate = function(element) {
    this._element = element;
    this._selectors = [];

    var selector0 = new CategorySelectBox();
    selector0.setLevel(0);
    selector0.setCategoryTree(this);
    selector0.decorate(element.find('.cat-col-0'));
    selector0.setSelectHandler(this.getSelectHandler(0));
    this._selectors.push(selector0);

    var selector1 = new CategorySelectBox();
    selector1.setLevel(1);
    selector1.setCategoryTree(this);
    selector1.decorate(element.find('.cat-col-1'));
    selector1.setSelectHandler(this.getSelectHandler(1));
    this._selectors.push(selector1)

    var selector2 = new CategorySelectBox();
    selector2.setLevel(2);
    selector2.setCategoryTree(this);
    selector2.decorate(element.find('.cat-col-2'));
    selector2.setSelectHandler(this.getSelectHandler(2));
    this._selectors.push(selector2);

    if (askbot['data']['userIsAdminOrMod']) {
        var editor_toggle = new CategoryEditorToggle();
        editor_toggle.setCategorySelector(this);
        var toggle_element = $('.category-editor-toggle');
        toggle_element.show();
        editor_toggle.decorate(toggle_element);
        this._editor_toggle = editor_toggle;
    }

    this.populateCategoryLevel([0]);
};

/**
 * @constructor
 * loads html for the category selector from
 * the server via ajax and activates the
 * CategorySelector on the loaded HTML
 */
var CategorySelectorLoader = function() {
    WrappedElement.call(this);
    this._is_loaded = false;
};
inherits(CategorySelectorLoader, WrappedElement);

CategorySelectorLoader.prototype.setCategorySelector = function(sel) {
    this._category_selector = sel;
};

CategorySelectorLoader.prototype.setLoaded = function(is_loaded) {
    this._is_loaded = is_loaded;
};

CategorySelectorLoader.prototype.isLoaded = function() {
    return this._is_loaded;
};

CategorySelectorLoader.prototype.setEditor = function(editor) {
    this._editor = editor;
};

CategorySelectorLoader.prototype.closeEditor = function() {
    this._editor.hide();
    this._editor_buttons.hide();
    this._display_tags_container.show();
    this._question_body.show();
    this._question_controls.show();
};

CategorySelectorLoader.prototype.openEditor = function() {
    this._editor.show();
    this._editor_buttons.show();
    this._display_tags_container.hide();
    this._question_body.hide();
    this._question_controls.hide();
    var sel = this._category_selector;
    sel.setState('select');
    sel.getEditorToggle().setState('off-state');
};

CategorySelectorLoader.prototype.addEditorButtons = function() {
    this._editor.after(this._editor_buttons);
};

CategorySelectorLoader.prototype.getOnLoadHandler = function() {
    var me = this;
    return function(html){
        me.setLoaded(true);

        //append loaded html to dom
        var editor = $('<div>' + html + '</div>');
        me.setEditor(editor);
        $('#question-tags').after(editor);

        var selector = askbot['functions']['initCategoryTree']();
        me.setCategorySelector(selector);

        me.addEditorButtons();
        me.openEditor();
        //add the save button
    };
};

CategorySelectorLoader.prototype.startLoadingHTML = function(on_load) {
    var me = this;
    $.ajax({
        type: 'GET',
        dataType: 'json',
        data: { template_name: 'widgets/tag_category_selector.html' },
        url: askbot['urls']['get_html_template'],
        cache: true,
        success: function(data) {
            if (data['success']) {
                on_load(data['html']);
            } else {
                showMessage(me.getElement(), data['message']);
            }
        }
    });
};

CategorySelectorLoader.prototype.getRetagHandler = function() {
    var me = this;
    return function() {
        if (me.isLoaded() === false) {
            me.startLoadingHTML(me.getOnLoadHandler());
        } else {
            me.openEditor();
        }
        return false;
    }
};

CategorySelectorLoader.prototype.drawNewTags = function(new_tags) {
    if (new_tags === ''){
        this._display_tags_container.html('');
        return;
    }
    new_tags = new_tags.split(/\s+/);
    var tags_html = ''
    $.each(new_tags, function(index, name){
        var tag = new Tag();
        tag.setName(name);
        tags_html += tag.getElement().outerHTML();
    });
    this._display_tags_container.html(tags_html);
};

CategorySelectorLoader.prototype.getSaveHandler = function() {
    var me = this;
    return function() {
        var tagInput = $('input[name="tags"]');
        $.ajax({
            type: "POST",
            url: retagUrl,//add to askbot['urls']
            dataType: "json",
            data: { tags: getUniqueWords(tagInput.val()).join(' ') },
            success: function(json) {
                if (json['success'] === true){
                    var new_tags = getUniqueWords(json['new_tags']);
                    oldTagsHtml = '';
                    me.closeEditor();
                    me.drawNewTags(new_tags.join(' '));
                }
                else {
                    me.closeEditor();
                    showMessage(me.getElement(), json['message']);
                }
            },
            error: function(xhr, textStatus, errorThrown) {
                showMessage(tagsDiv, 'sorry, something is not right here');
                cancelRetag();
            }
        });
        return false;
    };
};

CategorySelectorLoader.prototype.getCancelHandler = function() {
    var me = this;
    return function() {
        me.closeEditor();
    };
};

CategorySelectorLoader.prototype.decorate = function(element) {
    this._element = element;
    this._display_tags_container = $('#question-tags');
    this._question_body = $('.question-body');
    this._question_controls = $('#question-controls');

    this._editor_buttons = this.makeElement('div');
    this._done_button = this.makeElement('button');
    this._done_button.html(gettext('save tags'));
    this._editor_buttons.append(this._done_button);

    this._cancel_button = this.makeElement('button');
    this._cancel_button.html(gettext('cancel'));
    this._editor_buttons.append(this._cancel_button);
    this._editor_buttons.find('button').addClass('submit');
    this._editor_buttons.addClass('retagger-buttons');

    //done button
    setupButtonEventHandlers(
        this._done_button,
        this.getSaveHandler()
    );
    //cancel button
    setupButtonEventHandlers(
        this._cancel_button,
        this.getCancelHandler()
    );

    //retag button
    setupButtonEventHandlers(
        element,
        this.getRetagHandler()
    );
};

$(document).ready(function() {
    $('[id^="comments-for-"]').each(function(index, element){
        var comments = new PostCommentsWidget();
        comments.decorate(element);
    });
    $('[id^="swap-question-with-answer-"]').each(function(idx, element){
        var swapper = new QASwapper();
        swapper.decorate($(element));
    });
    $('[id^="post-id-"]').each(function(idx, element){
        var deleter = new DeletePostLink();
        //confusingly .question-delete matches the answers too need rename
        var post_id = element.id.split('-').pop();
        deleter.setPostId(post_id);
        deleter.decorate($(element).find('.question-delete'));
    });
    //todo: convert to "control" class
    var publishBtns = $('.answer-publish, .answer-unpublish');
    publishBtns.each(function(idx, btn) {
        setupButtonEventHandlers($(btn), function() {
            var answerId = $(btn).data('answerId');
            $.ajax({
                type: 'POST',
                dataType: 'json',
                data: {'answer_id': answerId},
                url: askbot['urls']['publishAnswer'],
                success: function(data) {
                    if (data['success']) {
                        window.location.reload(true);
                    } else {
                        showMessage($(btn), data['message']);
                    }
                }
            });
        });
    });

    if (askbot['settings']['tagSource'] == 'category-tree') {
        var catSelectorLoader = new CategorySelectorLoader();
        catSelectorLoader.decorate($('#retag'));
    } else {
        questionRetagger.init();
    }
    socialSharing.init();

    var proxyUserNameInput = $('#id_post_author_username');
    var proxyUserEmailInput = $('#id_post_author_email');
    if (proxyUserNameInput.length === 1) {

        var userSelectHandler = function(data) {
            proxyUserEmailInput.val(data['data'][0]);
        };

        var fakeUserAc = new AutoCompleter({
            url: '/get-users-info/',//askbot['urls']['get_users_info'],
            preloadData: true,
            promptText: gettext('User name:'),
            minChars: 1,
            useCache: true,
            matchInside: true,
            maxCacheLength: 100,
            delay: 10,
            onItemSelect: userSelectHandler
        });

        fakeUserAc.decorate(proxyUserNameInput);
        if (proxyUserEmailInput.length === 1) {
            var tip = new TippedInput();
            tip.decorate(proxyUserEmailInput);
        }
        
    }
    //if groups are enabled - activate share functions
    var groupsInput = $('#share_group_name');
    if (groupsInput.length === 1) {
        var groupsAc = new AutoCompleter({
            url: askbot['urls']['getGroupsList'],
            preloadData: true,
            promptText: gettext('Group name:'),
            minChars: 1,
            useCache: false,
            matchInside: true,
            maxCacheLength: 100,
            delay: 10
        });
        groupsAc.decorate(groupsInput);
    }
    var usersInput = $('#share_user_name');
    if (usersInput.length === 1) {
        var usersAc = new AutoCompleter({
            url: '/get-users-info/',
            preloadData: true,
            promptText: gettext('User name:'),
            minChars: 1,
            useCache: false,
            matchInside: true,
            maxCacheLength: 100,
            delay: 10
        });
        usersAc.decorate(usersInput);
    }

    var showSharedUsers = $('.see-related-users');
    if (showSharedUsers.length) {
        var usersPopup = new ThreadUsersDialog();
        usersPopup.setHeadingText(gettext('Shared with the following users:'));
        usersPopup.decorate(showSharedUsers);
    }
    var showSharedGroups = $('.see-related-groups');
    if (showSharedGroups.length) {
        var groupsPopup = new ThreadUsersDialog();
        groupsPopup.setHeadingText(gettext('Shared with the following groups:'));
        groupsPopup.decorate(showSharedGroups);
    }
});


/*
Prettify
http://www.apache.org/licenses/LICENSE-2.0
*/
var PR_SHOULD_USE_CONTINUATION = true; var PR_TAB_WIDTH = 8; var PR_normalizedHtml; var PR; var prettyPrintOne; var prettyPrint; function _pr_isIE6() { var isIE6 = navigator && navigator.userAgent && /\bMSIE 6\./.test(navigator.userAgent); _pr_isIE6 = function() { return isIE6; }; return isIE6; } (function() { function wordSet(words) { words = words.split(/ /g); var set = {}; for (var i = words.length; --i >= 0; ) { var w = words[i]; if (w) { set[w] = null; } } return set; } var FLOW_CONTROL_KEYWORDS = "break continue do else for if return while "; var C_KEYWORDS = FLOW_CONTROL_KEYWORDS + "auto case char const default " + "double enum extern float goto int long register short signed sizeof " + "static struct switch typedef union unsigned void volatile "; var COMMON_KEYWORDS = C_KEYWORDS + "catch class delete false import " + "new operator private protected public this throw true try "; var CPP_KEYWORDS = COMMON_KEYWORDS + "alignof align_union asm axiom bool " + "concept concept_map const_cast constexpr decltype " + "dynamic_cast explicit export friend inline late_check " + "mutable namespace nullptr reinterpret_cast static_assert static_cast " + "template typeid typename typeof using virtual wchar_t where "; var JAVA_KEYWORDS = COMMON_KEYWORDS + "boolean byte extends final finally implements import instanceof null " + "native package strictfp super synchronized throws transient "; var CSHARP_KEYWORDS = JAVA_KEYWORDS + "as base by checked decimal delegate descending event " + "fixed foreach from group implicit in interface internal into is lock " + "object out override orderby params readonly ref sbyte sealed " + "stackalloc string select uint ulong unchecked unsafe ushort var "; var JSCRIPT_KEYWORDS = COMMON_KEYWORDS + "debugger eval export function get null set undefined var with " + "Infinity NaN "; var PERL_KEYWORDS = "caller delete die do dump elsif eval exit foreach for " + "goto if import last local my next no our print package redo require " + "sub undef unless until use wantarray while BEGIN END "; var PYTHON_KEYWORDS = FLOW_CONTROL_KEYWORDS + "and as assert class def del " + "elif except exec finally from global import in is lambda " + "nonlocal not or pass print raise try with yield " + "False True None "; var RUBY_KEYWORDS = FLOW_CONTROL_KEYWORDS + "alias and begin case class def" + " defined elsif end ensure false in module next nil not or redo rescue " + "retry self super then true undef unless until when yield BEGIN END "; var SH_KEYWORDS = FLOW_CONTROL_KEYWORDS + "case done elif esac eval fi " + "function in local set then until "; var ALL_KEYWORDS = (CPP_KEYWORDS + CSHARP_KEYWORDS + JSCRIPT_KEYWORDS + PERL_KEYWORDS + PYTHON_KEYWORDS + RUBY_KEYWORDS + SH_KEYWORDS); var PR_STRING = 'str'; var PR_KEYWORD = 'kwd'; var PR_COMMENT = 'com'; var PR_TYPE = 'typ'; var PR_LITERAL = 'lit'; var PR_PUNCTUATION = 'pun'; var PR_PLAIN = 'pln'; var PR_TAG = 'tag'; var PR_DECLARATION = 'dec'; var PR_SOURCE = 'src'; var PR_ATTRIB_NAME = 'atn'; var PR_ATTRIB_VALUE = 'atv'; var PR_NOCODE = 'nocode'; function isWordChar(ch) { return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z'); } function spliceArrayInto(inserted, container, containerPosition, countReplaced) { inserted.unshift(containerPosition, countReplaced || 0); try { container.splice.apply(container, inserted); } finally { inserted.splice(0, 2); } } var REGEXP_PRECEDER_PATTERN = function() { var preceders = ["!", "!=", "!==", "#", "%", "%=", "&", "&&", "&&=", "&=", "(", "*", "*=", "+=", ",", "-=", "->", "/", "/=", ":", "::", ";", "<", "<<", "<<=", "<=", "=", "==", "===", ">", ">=", ">>", ">>=", ">>>", ">>>=", "?", "@", "[", "^", "^=", "^^", "^^=", "{", "|", "|=", "||", "||=", "~", "break", "case", "continue", "delete", "do", "else", "finally", "instanceof", "return", "throw", "try", "typeof"]; var pattern = '(?:' + '(?:(?:^|[^0-9.])\\.{1,3})|' + '(?:(?:^|[^\\+])\\+)|' + '(?:(?:^|[^\\-])-)'; for (var i = 0; i < preceders.length; ++i) { var preceder = preceders[i]; if (isWordChar(preceder.charAt(0))) { pattern += '|\\b' + preceder; } else { pattern += '|' + preceder.replace(/([^=<>:&])/g, '\\$1'); } } pattern += '|^)\\s*$'; return new RegExp(pattern); } (); var pr_amp = /&/g; var pr_lt = /</g; var pr_gt = />/g; var pr_quot = /\"/g; function attribToHtml(str) { return str.replace(pr_amp, '&amp;').replace(pr_lt, '&lt;').replace(pr_gt, '&gt;').replace(pr_quot, '&quot;'); } function textToHtml(str) { return str.replace(pr_amp, '&amp;').replace(pr_lt, '&lt;').replace(pr_gt, '&gt;'); } var pr_ltEnt = /&lt;/g; var pr_gtEnt = /&gt;/g; var pr_aposEnt = /&apos;/g; var pr_quotEnt = /&quot;/g; var pr_ampEnt = /&amp;/g; var pr_nbspEnt = /&nbsp;/g; function htmlToText(html) { var pos = html.indexOf('&'); if (pos < 0) { return html; } for (--pos; (pos = html.indexOf('&#', pos + 1)) >= 0; ) { var end = html.indexOf(';', pos); if (end >= 0) { var num = html.substring(pos + 3, end); var radix = 10; if (num && num.charAt(0) === 'x') { num = num.substring(1); radix = 16; } var codePoint = parseInt(num, radix); if (!isNaN(codePoint)) { html = (html.substring(0, pos) + String.fromCharCode(codePoint) + html.substring(end + 1)); } } } return html.replace(pr_ltEnt, '<').replace(pr_gtEnt, '>').replace(pr_aposEnt, "'").replace(pr_quotEnt, '"').replace(pr_ampEnt, '&').replace(pr_nbspEnt, ' '); } function isRawContent(node) { return 'XMP' === node.tagName; } function normalizedHtml(node, out) { switch (node.nodeType) { case 1: var name = node.tagName.toLowerCase(); out.push('<', name); for (var i = 0; i < node.attributes.length; ++i) { var attr = node.attributes[i]; if (!attr.specified) { continue; } out.push(' '); normalizedHtml(attr, out); } out.push('>'); for (var child = node.firstChild; child; child = child.nextSibling) { normalizedHtml(child, out); } if (node.firstChild || !/^(?:br|link|img)$/.test(name)) { out.push('<\/', name, '>'); } break; case 2: out.push(node.name.toLowerCase(), '="', attribToHtml(node.value), '"'); break; case 3: case 4: out.push(textToHtml(node.nodeValue)); break; } } var PR_innerHtmlWorks = null; function getInnerHtml(node) { if (null === PR_innerHtmlWorks) { var testNode = document.createElement('PRE'); testNode.appendChild(document.createTextNode('<!DOCTYPE foo PUBLIC "foo bar">\n<foo />')); PR_innerHtmlWorks = !/</.test(testNode.innerHTML); } if (PR_innerHtmlWorks) { var content = node.innerHTML; if (isRawContent(node)) { content = textToHtml(content); } return content; } var out = []; for (var child = node.firstChild; child; child = child.nextSibling) { normalizedHtml(child, out); } return out.join(''); } function makeTabExpander(tabWidth) { var SPACES = '                '; var charInLine = 0; return function(plainText) { var out = null; var pos = 0; for (var i = 0, n = plainText.length; i < n; ++i) { var ch = plainText.charAt(i); switch (ch) { case '\t': if (!out) { out = []; } out.push(plainText.substring(pos, i)); var nSpaces = tabWidth - (charInLine % tabWidth); charInLine += nSpaces; for (; nSpaces >= 0; nSpaces -= SPACES.length) { out.push(SPACES.substring(0, nSpaces)); } pos = i + 1; break; case '\n': charInLine = 0; break; default: ++charInLine; } } if (!out) { return plainText; } out.push(plainText.substring(pos)); return out.join(''); }; } var pr_chunkPattern = /(?:[^<]+|<!--[\s\S]*?-->|<!\[CDATA\[([\s\S]*?)\]\]>|<\/?[a-zA-Z][^>]*>|<)/g; var pr_commentPrefix = /^<!--/; var pr_cdataPrefix = /^<\[CDATA\[/; var pr_brPrefix = /^<br\b/i; var pr_tagNameRe = /^<(\/?)([a-zA-Z]+)/; function extractTags(s) { var matches = s.match(pr_chunkPattern); var sourceBuf = []; var sourceBufLen = 0; var extractedTags = []; if (matches) { for (var i = 0, n = matches.length; i < n; ++i) { var match = matches[i]; if (match.length > 1 && match.charAt(0) === '<') { if (pr_commentPrefix.test(match)) { continue; } if (pr_cdataPrefix.test(match)) { sourceBuf.push(match.substring(9, match.length - 3)); sourceBufLen += match.length - 12; } else if (pr_brPrefix.test(match)) { sourceBuf.push('\n'); ++sourceBufLen; } else { if (match.indexOf(PR_NOCODE) >= 0 && isNoCodeTag(match)) { var name = match.match(pr_tagNameRe)[2]; var depth = 1; end_tag_loop: for (var j = i + 1; j < n; ++j) { var name2 = matches[j].match(pr_tagNameRe); if (name2 && name2[2] === name) { if (name2[1] === '/') { if (--depth === 0) { break end_tag_loop; } } else { ++depth; } } } if (j < n) { extractedTags.push(sourceBufLen, matches.slice(i, j + 1).join('')); i = j; } else { extractedTags.push(sourceBufLen, match); } } else { extractedTags.push(sourceBufLen, match); } } } else { var literalText = htmlToText(match); sourceBuf.push(literalText); sourceBufLen += literalText.length; } } } return { source: sourceBuf.join(''), tags: extractedTags }; } function isNoCodeTag(tag) { return !!tag.replace(/\s(\w+)\s*=\s*(?:\"([^\"]*)\"|'([^\']*)'|(\S+))/g, ' $1="$2$3$4"').match(/[cC][lL][aA][sS][sS]=\"[^\"]*\bnocode\b/); } function createSimpleLexer(shortcutStylePatterns, fallthroughStylePatterns) { var shortcuts = {}; (function() { var allPatterns = shortcutStylePatterns.concat(fallthroughStylePatterns); for (var i = allPatterns.length; --i >= 0; ) { var patternParts = allPatterns[i]; var shortcutChars = patternParts[3]; if (shortcutChars) { for (var c = shortcutChars.length; --c >= 0; ) { shortcuts[shortcutChars.charAt(c)] = patternParts; } } } })(); var nPatterns = fallthroughStylePatterns.length; var notWs = /\S/; return function(sourceCode, opt_basePos) { opt_basePos = opt_basePos || 0; var decorations = [opt_basePos, PR_PLAIN]; var lastToken = ''; var pos = 0; var tail = sourceCode; while (tail.length) { var style; var token = null; var match; var patternParts = shortcuts[tail.charAt(0)]; if (patternParts) { match = tail.match(patternParts[1]); token = match[0]; style = patternParts[0]; } else { for (var i = 0; i < nPatterns; ++i) { patternParts = fallthroughStylePatterns[i]; var contextPattern = patternParts[2]; if (contextPattern && !contextPattern.test(lastToken)) { continue; } match = tail.match(patternParts[1]); if (match) { token = match[0]; style = patternParts[0]; break; } } if (!token) { style = PR_PLAIN; token = tail.substring(0, 1); } } decorations.push(opt_basePos + pos, style); pos += token.length; tail = tail.substring(token.length); if (style !== PR_COMMENT && notWs.test(token)) { lastToken = token; } } return decorations; }; } var PR_MARKUP_LEXER = createSimpleLexer([], [[PR_PLAIN, /^[^<]+/, null], [PR_DECLARATION, /^<!\w[^>]*(?:>|$)/, null], [PR_COMMENT, /^<!--[\s\S]*?(?:-->|$)/, null], [PR_SOURCE, /^<\?[\s\S]*?(?:\?>|$)/, null], [PR_SOURCE, /^<%[\s\S]*?(?:%>|$)/, null], [PR_SOURCE, /^<(script|style|xmp)\b[^>]*>[\s\S]*?<\/\1\b[^>]*>/i, null], [PR_TAG, /^<\/?\w[^<>]*>/, null]]); var PR_SOURCE_CHUNK_PARTS = /^(<[^>]*>)([\s\S]*)(<\/[^>]*>)$/; function tokenizeMarkup(source) { var decorations = PR_MARKUP_LEXER(source); for (var i = 0; i < decorations.length; i += 2) { if (decorations[i + 1] === PR_SOURCE) { var start, end; start = decorations[i]; end = i + 2 < decorations.length ? decorations[i + 2] : source.length; var sourceChunk = source.substring(start, end); var match = sourceChunk.match(PR_SOURCE_CHUNK_PARTS); if (match) { decorations.splice(i, 2, start, PR_TAG, start + match[1].length, PR_SOURCE, start + match[1].length + (match[2] || '').length, PR_TAG); } } } return decorations; } var PR_TAG_LEXER = createSimpleLexer([[PR_ATTRIB_VALUE, /^\'[^\']*(?:\'|$)/, null, "'"], [PR_ATTRIB_VALUE, /^\"[^\"]*(?:\"|$)/, null, '"'], [PR_PUNCTUATION, /^[<>\/=]+/, null, '<>/=']], [[PR_TAG, /^[\w:\-]+/, /^</], [PR_ATTRIB_VALUE, /^[\w\-]+/, /^=/], [PR_ATTRIB_NAME, /^[\w:\-]+/, null], [PR_PLAIN, /^\s+/, null, ' \t\r\n']]); function splitTagAttributes(source, decorations) { for (var i = 0; i < decorations.length; i += 2) { var style = decorations[i + 1]; if (style === PR_TAG) { var start, end; start = decorations[i]; end = i + 2 < decorations.length ? decorations[i + 2] : source.length; var chunk = source.substring(start, end); var subDecorations = PR_TAG_LEXER(chunk, start); spliceArrayInto(subDecorations, decorations, i, 2); i += subDecorations.length - 2; } } return decorations; } function sourceDecorator(options) { var shortcutStylePatterns = [], fallthroughStylePatterns = []; if (options.tripleQuotedStrings) { shortcutStylePatterns.push([PR_STRING, /^(?:\'\'\'(?:[^\'\\]|\\[\s\S]|\'{1,2}(?=[^\']))*(?:\'\'\'|$)|\"\"\"(?:[^\"\\]|\\[\s\S]|\"{1,2}(?=[^\"]))*(?:\"\"\"|$)|\'(?:[^\\\']|\\[\s\S])*(?:\'|$)|\"(?:[^\\\"]|\\[\s\S])*(?:\"|$))/, null, '\'"']); } else if (options.multiLineStrings) { shortcutStylePatterns.push([PR_STRING, /^(?:\'(?:[^\\\']|\\[\s\S])*(?:\'|$)|\"(?:[^\\\"]|\\[\s\S])*(?:\"|$)|\`(?:[^\\\`]|\\[\s\S])*(?:\`|$))/, null, '\'"`']); } else { shortcutStylePatterns.push([PR_STRING, /^(?:\'(?:[^\\\'\r\n]|\\.)*(?:\'|$)|\"(?:[^\\\"\r\n]|\\.)*(?:\"|$))/, null, '"\'']); } fallthroughStylePatterns.push([PR_PLAIN, /^(?:[^\'\"\`\/\#]+)/, null, ' \r\n']); if (options.hashComments) { shortcutStylePatterns.push([PR_COMMENT, /^#[^\r\n]*/, null, '#']); } if (options.cStyleComments) { fallthroughStylePatterns.push([PR_COMMENT, /^\/\/[^\r\n]*/, null]); fallthroughStylePatterns.push([PR_COMMENT, /^\/\*[\s\S]*?(?:\*\/|$)/, null]); } if (options.regexLiterals) { var REGEX_LITERAL = ('^/(?=[^/*])' + '(?:[^/\\x5B\\x5C]' + '|\\x5C[\\s\\S]' + '|\\x5B(?:[^\\x5C\\x5D]|\\x5C[\\s\\S])*(?:\\x5D|$))+' + '(?:/|$)'); fallthroughStylePatterns.push([PR_STRING, new RegExp(REGEX_LITERAL), REGEXP_PRECEDER_PATTERN]); } var keywords = wordSet(options.keywords); options = null; var splitStringAndCommentTokens = createSimpleLexer(shortcutStylePatterns, fallthroughStylePatterns); var styleLiteralIdentifierPuncRecognizer = createSimpleLexer([], [[PR_PLAIN, /^\s+/, null, ' \r\n'], [PR_PLAIN, /^[a-z_$@][a-z_$@0-9]*/i, null], [PR_LITERAL, /^0x[a-f0-9]+[a-z]/i, null], [PR_LITERAL, /^(?:\d(?:_\d+)*\d*(?:\.\d*)?|\.\d+)(?:e[+\-]?\d+)?[a-z]*/i, null, '123456789'], [PR_PUNCTUATION, /^[^\s\w\.$@]+/, null]]); function splitNonStringNonCommentTokens(source, decorations) { for (var i = 0; i < decorations.length; i += 2) { var style = decorations[i + 1]; if (style === PR_PLAIN) { var start, end, chunk, subDecs; start = decorations[i]; end = i + 2 < decorations.length ? decorations[i + 2] : source.length; chunk = source.substring(start, end); subDecs = styleLiteralIdentifierPuncRecognizer(chunk, start); for (var j = 0, m = subDecs.length; j < m; j += 2) { var subStyle = subDecs[j + 1]; if (subStyle === PR_PLAIN) { var subStart = subDecs[j]; var subEnd = j + 2 < m ? subDecs[j + 2] : chunk.length; var token = source.substring(subStart, subEnd); if (token === '.') { subDecs[j + 1] = PR_PUNCTUATION; } else if (token in keywords) { subDecs[j + 1] = PR_KEYWORD; } else if (/^@?[A-Z][A-Z$]*[a-z][A-Za-z$]*$/.test(token)) { subDecs[j + 1] = token.charAt(0) === '@' ? PR_LITERAL : PR_TYPE; } } } spliceArrayInto(subDecs, decorations, i, 2); i += subDecs.length - 2; } } return decorations; } return function(sourceCode) { var decorations = splitStringAndCommentTokens(sourceCode); decorations = splitNonStringNonCommentTokens(sourceCode, decorations); return decorations; }; } var decorateSource = sourceDecorator({ keywords: ALL_KEYWORDS, hashComments: true, cStyleComments: true, multiLineStrings: true, regexLiterals: true }); function splitSourceNodes(source, decorations) { for (var i = 0; i < decorations.length; i += 2) { var style = decorations[i + 1]; if (style === PR_SOURCE) { var start, end; start = decorations[i]; end = i + 2 < decorations.length ? decorations[i + 2] : source.length; var subDecorations = decorateSource(source.substring(start, end)); for (var j = 0, m = subDecorations.length; j < m; j += 2) { subDecorations[j] += start; } spliceArrayInto(subDecorations, decorations, i, 2); i += subDecorations.length - 2; } } return decorations; } function splitSourceAttributes(source, decorations) { var nextValueIsSource = false; for (var i = 0; i < decorations.length; i += 2) { var style = decorations[i + 1]; var start, end; if (style === PR_ATTRIB_NAME) { start = decorations[i]; end = i + 2 < decorations.length ? decorations[i + 2] : source.length; nextValueIsSource = /^on|^style$/i.test(source.substring(start, end)); } else if (style === PR_ATTRIB_VALUE) { if (nextValueIsSource) { start = decorations[i]; end = i + 2 < decorations.length ? decorations[i + 2] : source.length; var attribValue = source.substring(start, end); var attribLen = attribValue.length; var quoted = (attribLen >= 2 && /^[\"\']/.test(attribValue) && attribValue.charAt(0) === attribValue.charAt(attribLen - 1)); var attribSource; var attribSourceStart; var attribSourceEnd; if (quoted) { attribSourceStart = start + 1; attribSourceEnd = end - 1; attribSource = attribValue; } else { attribSourceStart = start + 1; attribSourceEnd = end - 1; attribSource = attribValue.substring(1, attribValue.length - 1); } var attribSourceDecorations = decorateSource(attribSource); for (var j = 0, m = attribSourceDecorations.length; j < m; j += 2) { attribSourceDecorations[j] += attribSourceStart; } if (quoted) { attribSourceDecorations.push(attribSourceEnd, PR_ATTRIB_VALUE); spliceArrayInto(attribSourceDecorations, decorations, i + 2, 0); } else { spliceArrayInto(attribSourceDecorations, decorations, i, 2); } } nextValueIsSource = false; } } return decorations; } function decorateMarkup(sourceCode) { var decorations = tokenizeMarkup(sourceCode); decorations = splitTagAttributes(sourceCode, decorations); decorations = splitSourceNodes(sourceCode, decorations); decorations = splitSourceAttributes(sourceCode, decorations); return decorations; } function recombineTagsAndDecorations(sourceText, extractedTags, decorations) { var html = []; var outputIdx = 0; var openDecoration = null; var currentDecoration = null; var tagPos = 0; var decPos = 0; var tabExpander = makeTabExpander(PR_TAB_WIDTH); var adjacentSpaceRe = /([\r\n ]) /g; var startOrSpaceRe = /(^| ) /gm; var newlineRe = /\r\n?|\n/g; var trailingSpaceRe = /[ \r\n]$/; var lastWasSpace = true; function emitTextUpTo(sourceIdx) { if (sourceIdx > outputIdx) { if (openDecoration && openDecoration !== currentDecoration) { html.push('</span>'); openDecoration = null; } if (!openDecoration && currentDecoration) { openDecoration = currentDecoration; html.push('<span class="', openDecoration, '">'); } var htmlChunk = textToHtml(tabExpander(sourceText.substring(outputIdx, sourceIdx))).replace(lastWasSpace ? startOrSpaceRe : adjacentSpaceRe, '$1&nbsp;'); lastWasSpace = trailingSpaceRe.test(htmlChunk); html.push(htmlChunk.replace(newlineRe, '<br />')); outputIdx = sourceIdx; } } while (true) { var outputTag; if (tagPos < extractedTags.length) { if (decPos < decorations.length) { outputTag = extractedTags[tagPos] <= decorations[decPos]; } else { outputTag = true; } } else { outputTag = false; } if (outputTag) { emitTextUpTo(extractedTags[tagPos]); if (openDecoration) { html.push('</span>'); openDecoration = null; } html.push(extractedTags[tagPos + 1]); tagPos += 2; } else if (decPos < decorations.length) { emitTextUpTo(decorations[decPos]); currentDecoration = decorations[decPos + 1]; decPos += 2; } else { break; } } emitTextUpTo(sourceText.length); if (openDecoration) { html.push('</span>'); } return html.join(''); } var langHandlerRegistry = {}; function registerLangHandler(handler, fileExtensions) { for (var i = fileExtensions.length; --i >= 0; ) { var ext = fileExtensions[i]; if (!langHandlerRegistry.hasOwnProperty(ext)) { langHandlerRegistry[ext] = handler; } else if ('console' in window) { console.log('cannot override language handler %s', ext); } } } registerLangHandler(decorateSource, ['default-code']); registerLangHandler(decorateMarkup, ['default-markup', 'html', 'htm', 'xhtml', 'xml', 'xsl']); registerLangHandler(sourceDecorator({ keywords: CPP_KEYWORDS, hashComments: true, cStyleComments: true }), ['c', 'cc', 'cpp', 'cs', 'cxx', 'cyc']); registerLangHandler(sourceDecorator({ keywords: JAVA_KEYWORDS, cStyleComments: true }), ['java']); registerLangHandler(sourceDecorator({ keywords: SH_KEYWORDS, hashComments: true, multiLineStrings: true }), ['bsh', 'csh', 'sh']); registerLangHandler(sourceDecorator({ keywords: PYTHON_KEYWORDS, hashComments: true, multiLineStrings: true, tripleQuotedStrings: true }), ['cv', 'py']); registerLangHandler(sourceDecorator({ keywords: PERL_KEYWORDS, hashComments: true, multiLineStrings: true, regexLiterals: true }), ['perl', 'pl', 'pm']); registerLangHandler(sourceDecorator({ keywords: RUBY_KEYWORDS, hashComments: true, multiLineStrings: true, regexLiterals: true }), ['rb']); registerLangHandler(sourceDecorator({ keywords: JSCRIPT_KEYWORDS, cStyleComments: true, regexLiterals: true }), ['js']); function prettyPrintOne(sourceCodeHtml, opt_langExtension) { try { var sourceAndExtractedTags = extractTags(sourceCodeHtml); var source = sourceAndExtractedTags.source; var extractedTags = sourceAndExtractedTags.tags; if (!langHandlerRegistry.hasOwnProperty(opt_langExtension)) { opt_langExtension = /^\s*</.test(source) ? 'default-markup' : 'default-code'; } var decorations = langHandlerRegistry[opt_langExtension].call({}, source); return recombineTagsAndDecorations(source, extractedTags, decorations); } catch (e) { if ('console' in window) { console.log(e); console.trace(); } return sourceCodeHtml; } } function prettyPrint(opt_whenDone) { var isIE6 = _pr_isIE6(); var codeSegments = [document.getElementsByTagName('pre'), document.getElementsByTagName('code'), document.getElementsByTagName('xmp')]; var elements = []; for (var i = 0; i < codeSegments.length; ++i) { for (var j = 0; j < codeSegments[i].length; ++j) { elements.push(codeSegments[i][j]); } } codeSegments = null; var k = 0; function doWork() { var endTime = (PR_SHOULD_USE_CONTINUATION ? new Date().getTime() + 250 : Infinity); for (; k < elements.length && new Date().getTime() < endTime; k++) { var cs = elements[k]; if (cs.className && cs.className.indexOf('prettyprint') >= 0) { var langExtension = cs.className.match(/\blang-(\w+)\b/); if (langExtension) { langExtension = langExtension[1]; } var nested = false; for (var p = cs.parentNode; p; p = p.parentNode) { if ((p.tagName === 'pre' || p.tagName === 'code' || p.tagName === 'xmp') && p.className && p.className.indexOf('prettyprint') >= 0) { nested = true; break; } } if (!nested) { var content = getInnerHtml(cs); content = content.replace(/(?:\r\n?|\n)$/, ''); var newContent = prettyPrintOne(content, langExtension); if (!isRawContent(cs)) { cs.innerHTML = newContent; } else { var pre = document.createElement('PRE'); for (var i = 0; i < cs.attributes.length; ++i) { var a = cs.attributes[i]; if (a.specified) { var aname = a.name.toLowerCase(); if (aname === 'class') { pre.className = a.value; } else { pre.setAttribute(a.name, a.value); } } } pre.innerHTML = newContent; cs.parentNode.replaceChild(pre, cs); cs = pre; } if (isIE6 && cs.tagName === 'PRE') { var lineBreaks = cs.getElementsByTagName('br'); for (var j = lineBreaks.length; --j >= 0; ) { var lineBreak = lineBreaks[j]; lineBreak.parentNode.replaceChild(document.createTextNode('\r\n'), lineBreak); } } } } } if (k < elements.length) { setTimeout(doWork, 250); } else if (opt_whenDone) { opt_whenDone(); } } doWork(); } window['PR_normalizedHtml'] = normalizedHtml; window['prettyPrintOne'] = prettyPrintOne; window['prettyPrint'] = prettyPrint; window['PR'] = { 'createSimpleLexer': createSimpleLexer, 'registerLangHandler': registerLangHandler, 'sourceDecorator': sourceDecorator, 'PR_ATTRIB_NAME': PR_ATTRIB_NAME, 'PR_ATTRIB_VALUE': PR_ATTRIB_VALUE, 'PR_COMMENT': PR_COMMENT, 'PR_DECLARATION': PR_DECLARATION, 'PR_KEYWORD': PR_KEYWORD, 'PR_LITERAL': PR_LITERAL, 'PR_NOCODE': PR_NOCODE, 'PR_PLAIN': PR_PLAIN, 'PR_PUNCTUATION': PR_PUNCTUATION, 'PR_SOURCE': PR_SOURCE, 'PR_STRING': PR_STRING, 'PR_TAG': PR_TAG, 'PR_TYPE': PR_TYPE }; })();
