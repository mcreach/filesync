'use strict';
angular.module('FileSync').controller('HistoryCtrl', ['$scope','HistoryService', 'SocketIOService', 'VisibilityService',
  function ($scope, HistoryService,SocketIOService,VisibilityService) {
    this.edits = HistoryService.edits;

    this.visibility = VisibilityService;
    this.newComment;
    this.listModifiedFiles = HistoryService.listModifiedFiles;
    this.fileSelected;

    this.showFile=function(filename){
      this.fileSelected=filename;
    }
    this.remove = function (edit) {
      HistoryService.remove(edit);
    };
    this.addComment = function(edit){
      HistoryService.addComment(edit, this.newComment);
      this.newComment="";
    }
    function onComment(edits){
      this.edits = [];
      $scope.$apply();//
    }

  SocketIOService.onComment(onComment.bind(this));



  }]);
