var app = angular.module('Authentication', []);

app.controller('LoginController',['$scope', '$rootScope', '$http', function ($scope) {

        //Check that logged in cookie exists
        //If not, redirect to login screen

        $scope.LogIn = function () {
            var user = {
                username:$scope.username,
                password:$scope.password
            };

        $.ajax({
            url:  'https://dvt-assettracking-staging.azurewebsites.net/api/signin ',
            type: 'POST',
            data: user,
            cache: false,
            success: function (response) {
//              alert(JSON.stringify(response));
               if(response.isSignedIn==true){
               $.cookie("isSignedIn", true);
                window.location.href = "angular.html";
               }else{
                        window.location.href = "login.html";
                     $("#incorrect").removeClass("progressHide");
                     $("#incorrect").addClass("progressShow");

//                     $cookies.put("IsLogIn" , response);
//                     $cookies.put(username,);
               }
            },
            error: function(error){
                console.log("Error : " +JSON.stringify(error));
            }

        });
    };
}

]);