'use strict';
angular.module('FileSync')
  .factory('HistoryService', function (SocketIOService, _) {
    var edits = [];
    var listModifiedFiles = {};

    SocketIOService.onFileChanged(function (filename, timestamp, content, comments) {

      listModifiedFiles[filename] = {"filename":filename,"content": content};


      edits.unshift({
        filename: filename,
        timestamp: timestamp,
        content: content,
        comments:comments
      });
    });

    return {
      edits: edits,
      listModifiedFiles: listModifiedFiles,
      remove: function (edit) {
        _.remove(edits, edit);
      },
      addComment: function(edit,newComment){
        edit.comments.push(newComment);
        SocketIOService.sendComment(edits);
      }
    };
  });
