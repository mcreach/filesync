'use strict';
angular
  .module('FileSync')
  .controller('SocialCtrl', ['$scope', 'SocketIOService', function($scope, SocketIOService) {
    this.viewers = [];
    this.listMessages = [];
    this.message;

    function onViewersUpdated(viewers) {
      this.viewers = viewers;
      $scope.$apply();
    }

    this.sendMessage = function(){
      console.log("I'm here");
      SocketIOService.sendMessage(this.message);
      this.message = "";
    }

    function onMessage(messages){
        this.listMessages = messages;//fefze
        console.log("mesage");
        $scope.$apply();
    }

    SocketIOService.onMessage(onMessage.bind(this));
    SocketIOService.onViewersUpdated(onViewersUpdated.bind(this));
  }]);
