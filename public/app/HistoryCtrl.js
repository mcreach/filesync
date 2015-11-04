'use strict';
angular.module('FileSync').controller('HistoryCtrl', ['$scope','HistoryService', 'SocketIOService', 'VisibilityService',
  function ($scope, HistoryService,SocketIOService,VisibilityService) {

    this.visibility = VisibilityService;
    this.newComment;
    this.listModifiedFiles = HistoryService.listModifiedFiles;
    this.fileSelected;

    this.showFile=function(file){
      this.fileSelected = file;
    }

    this.remove = function (file) {
      HistoryService.remove(file);
    };

    this.sendComment = function(){
      HistoryService.sendComment(this.newComment);
    }

    function onComment(comment){
        HistoryService.addComment(this.fileSelected.filename, comment);
        this.newComment="";
        $scope.$apply();
    }

    SocketIOService.onComment(onComment.bind(this));



  }]);
