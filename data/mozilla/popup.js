/* Copyright (c) 2012-2015 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */
/* global saveAs, DOMPurify */
'use strict';

(function() {
  var tags;
  var title;
  var html;
  var htmlTemplate;
  var tagLibrary;
  var currentSelection;

  function init(selection) {
    console.log("Mozilla Popup init...");
    $("#startTagSpaces").on("click", function(e) {
      self.port.emit('openNewTab', e.toString());
    });
    $("#saveAsMhtml").on('click', saveAsMHTML);
    $("#saveSelectionAsHtml").on("click", saveSelectionAsHtml);
    $("#saveScreenshot").on("click", saveScreenshot);
  }

  function saveSelectionAsHtml() {
    if (currentSelection) {
      var content = prepareContent(currentSelection);  
       
      if (tags) {
        tags = tags.split(",").join(" ");
        self.port.emit('saveSelectionAsHtml', $('#title').val() + ' [' + tags + '].html', content);
      } else {
        self.port.emit('saveSelectionAsHtml', $('#title').val() + '.html', content);
      }
    } else {
      alert("Please select text");
    }
  }

  function saveAsMHTML() {
    if (tags) {
      tags = tags.split(",").join(" ");
      self.port.emit('saveAsMHTML', $('#title').val() + ' [' + tags + '].html');
    } else {
      self.port.emit('saveAsMHTML', $('#title').val() + '.html');
    }
  }

  function saveScreenshot() { 
    if (tags) {
      tags = tags.split(",").join(" ");
      self.port.emit('saveScreenshot', $('#title').val() + ' [' + tags + '].png');
    } else {
      self.port.emit('saveScreenshot', $('#title').val() + '.png');
    }
  }

  function prepareContent(uncleanedHTML) {
    //console.log("uncleaned "+uncleanedHTML);
    var cleanedHTML = DOMPurify.sanitize(uncleanedHTML);

    cleanedHTML = "<body>" + cleanedHTML + "</body>";
    cleanedHTML = htmlTemplate.replace(/\<body[^>]*\>([^]*)\<\/body>/m, cleanedHTML); // jshint ignore:line
    return cleanedHTML;
  }

  function loadSettingsLocalStorage() {
    try {
      var settings = JSON.parse(localStorage.getItem('tagSpacesSettings'));
      //console.log("Settings: " + JSON.stringify(settings));
      if (settings !== null) {
        htmlTemplate = settings.newHTMLFileContent;
        tagLibrary = settings.tagGroups;
      } else {
          htmlTemplate = "<html><body></body></html>";
      }
      console.log("Loaded settings from local storage: " + JSON.stringify(tagLibrary));
    } catch (ex) {
      console.log("Loading settings from local storage failed due exception: " + ex);
    }
  }

  function extractAllTags() {
    var allTags = [];
    if (tagLibrary === undefined) {
      return allTags;
    }
    for (var i = 0; i < tagLibrary.length; i++) {
      for (var j = 0; j < tagLibrary[i].children.length; j++) {
        if (tagLibrary[i].children[j].type === "plain") {
          allTags.push(tagLibrary[i].children[j].title);
        }
      }
    }
    return allTags;
  }

  //$(document).ready(init);
  init();

  self.port.on("show", function(selection, title) {
   
    //self.postMessage('show', "ddd1");
    loadSettingsLocalStorage();
    currentSelection = selection;
    var tagList = extractAllTags(tagLibrary);
    
    $('#title').val(title);
    $('#title').focus();

    $('#tags').select2('data', null);
    $("#tags").select2({
      multiple: true,
      tags: tagList,
      tokenSeparators: [",", " "],
      minimumInputLength: 2,
      selectOnBlur: true
    });
  });

  self.port.on("hide", function(){
    console.log("Hide Popup");
  });

  return {};
}());
