'use strict';
angular.module('FileSync')
  .factory('HistoryService', function (SocketIOService, _) {

    var listModifiedFiles = {};

    SocketIOService.onFileChanged(function (filename, timestamp, content, comments) {

      if(listModifiedFiles[filename] == undefined){
        listModifiedFiles[filename] = {"filename":filename,"edits": []};
      }

      listModifiedFiles[filename].edits.unshift({
        timestamp: timestamp,
        content: content,
        comments: []
      });

      console.log(listModifiedFiles[filename]);
    });

    return {
      /*edits: edits,

      remove: function (edit) {
        _.remove(edits, edit);
      },*/

      listModifiedFiles: listModifiedFiles,
      sendComment: function(newComment){
        console.log("HistoryService sendComment");
        SocketIOService.sendComment(newComment);
      },
      addComment: function(filename, comment){
        console.log("HistoryService addComment");

        listModifiedFiles[filename].edits[0].comments.push(comment);
        console.log(listModifiedFiles[filename]);
      }
    };
  });
