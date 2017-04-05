var consultant = angular.module('consultant', [])
    .directive('ngFiles', ['$parse', function ($parse) {

        function fn_link(scope, element, attrs) {
            var onChange = $parse(attrs.ngFiles);
            element.on('change', function (event) {
                onChange(scope, { $files: event.target.files });
            });
        };

        return {
            link: fn_link
        }
    }])

    .config(function ($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        $httpProvider.defaults.headers.common['X-Requested-With'];


    })
    .controller('consultantCtrl', ['$scope', '$http', function ($scope, $http) {
        function consultantCtrl($scope) {
            $scope.consultants = [];
        }


        var API_URL='https://dvt-assettracking-staging.azurewebsites.net/api/';
        $scope.consultants = [];
        $scope.imageURLforAsset = [];
        $scope.asset = [];
        $scope.clients = [];
        $scope.status = [];
        $scope.practices = [];
        $scope.pracs = [];
        $scope.cli = [];
        $scope.countA = 0;
        $scope.countC = 0;
        $scope.newConsultant = {};
        $scope.clientName = [];

        var clientsList =[];


        var isLoggedIn = $.cookie("isSignedIn");
//        alert(isLoggedIn);
        if(!isLoggedIn){
            window.location.href = "login.html";
        }
        
        if(typeof(Storage) !== "undefined") {
            if (localStorage.assetCount) {
                $scope.countA = localStorage.assetCount;
            }
            if (localStorage.consultantCount) {
                $scope.countC = localStorage.consultantCount;
            }
        };

        var formdata = new FormData();

        $scope.getAllConsultants = function () {
            $http.get(API_URL + 'Consultant')
                .success(function (response) {
                    $scope.consultants = response;
                    $scope.imageURL = response;
                    $scope.clientName = response;
                    clientsList = response;
                    $scope.defaultImageUrl = 'images/nobody_m.original.jpg';

                    if ( !$scope.consultants.imageURL || $scope.consultants.imageURL === '' ) {
                        $scope.consultants.imageURL = $scope.defaultImageUrl;
                    }
                
                    if(typeof(Storage) !== "undefined") {
                    localStorage.consultantCount = $scope.consultants.length;
//                        if (localStorage.consultantCount) {
//                            if(localStorage.consultantCount != $scope.consultants.length){
//                                localStorage.consultantCount = $scope.consultants.length;
//                               }
//                        } else {
//                            localStorage.consultantCount = $scope.consultants.length;
//                        }
                    $scope.countC = localStorage.consultantCount;
                    } else {
                        $scope.countC = $scope.consultants.length;
                        console.error("This browser does't support local storage for consultants")
                    }
                    $("#tablebody").removeClass("loading");
                })
                .error(function (response) {
                    console.log(response);
                })

            $http.get(API_URL + 'asset', 500)
                .success(function (response) {
                    $scope.countA = response.length;
                    $scope.asset = response
                
                if(typeof(Storage) !== "undefined") {
                localStorage.assetCount = response.length;
//                        if (localStorage.assetCount) {
//                            if(localStorage.assetCount != response.length){
//                                localStorage.assetCount = response.length;
//                               }
//                        } else {
//                            localStorage.assetCount = response.length;
//                        }
                        $scope.countA = localStorage.assetCount;
                    } else {
                        $scope.countA = response.length;
                        console.error("This browser does't support local storage for assets")
                    }
                    angular.forEach($scope.asset, function(aset){
                        aset["propic"]="";
                        if(aset.imageURL.length > 0) {
                            angular.forEach(aset.imageURL, function(image){
                                image["url"] = image.uri;
                                image.uri="";
                                $scope.imageURLforAsset.push(image);
                                if (image.imagesPriority === 1) {
                                    aset["propic"]=image.url;
                                    return;
                                }
                            });
                        }
                        else {
                            aset.propic = 'images/logo2.jpg';
                        }
                    });
                })
                .error(function (response) {
                    console.log("images: " + $scope.imageURLforAsset);
                })

            $http.get(API_URL + 'Practice', 500)
                .success(function (response) {
                    $scope.practices = response.practiceList;
                    console.log(response);

                })
                .error(function (response) {
                    console.log(response);
                });

            $http.get(API_URL + 'client', 500)
                .success(function (response) {
                    $scope.clients = response.clientList;
                    console.log(response);

                })
                .error(function (response) {
                    console.log(response);
                })
        }


        $scope.createConsultant = function () {

//           $scope.newConsultant.clientName = $('#ConsultantClients').select2("data")[0].text;
           $scope.newConsultant.clientID = $('#ConsultantClients').select2("data")[0].text;
           console.log("selected Client : "+JSON.stringify($scope.newConsultant));
            var params = {
                clientName: $scope.newConsultant.clientName,
                name: $scope.newConsultant.fname + ' ' + $scope.newConsultant.lname,
                employmentType: $scope.newConsultant.Consultant.employmentType,
                practiceID: $scope.newConsultant.Practice.practiceID
            };
              var clientId =getClientID($scope.newConsultant.clientName, clientsList);
                             console.log("clientId : ");
                             console.log(clientId);
                             if(clientId!=null){
                                 $scope.newConsultant.clientID = clientId;
                             }else{
                                 $scope.newConsultant.clientName =  $scope.newConsultant.clientName;
                             }

console.log(params);
            $.ajax({
                url: API_URL + 'Consultant',
                type: 'POST',
                data: params,
                cache: false,
                success: function (msg) {

                    var request = {
                        method: 'POST',
                        url: API_URL + 'upload',
                        data: formdata,
                        headers: {
                            'Content-Type': undefined
                        }
                    };

                    // SEND THE FILES.
                    $http(request)
                        .success(function (d) {
                            var image = {
                                parentID: msg.consultantID,
                                uri: d.url,
                                imagesPriority: '0'
                            };
                                $.ajax({
                                    url: API_URL + 'image',
                                    type: 'POST',
                                    data: image,
                                    cache: false,
                                    success: function(res){
                                        hideButtonSpinner()
                                        location.reload();

                                        console.log(JSON.stringify(res)
                                        )},
                                    error: function(res){
                                        hideButtonSpinner()
                                    }

                                });
                        })
                        .error(function () {
                        });


                },
                error: function (msg) {
                    alert(JSON.stringify(msg))
                }



            });
        }

$scope.reloadRoute = function(){
            location.reload();
        }

        //filter by practices
        $scope.practiceFilter = {};
        $scope.filterByPractice = function(practiceName) {
            if (practiceName === 'All') {
                $scope.practiceFilter = {};
            }
            else {
                $scope.practiceFilter.practiceName = practiceName;
            }
        };


        $scope.viewConsultantClick = function (id) {
            $("#aatbody").addClass("loading");
            $scope.noAssetsMessage = "";
            $scope.viewConsultant = _.find($scope.consultants, function (consultant) { return consultant.consultantID === id });

            var localScope = $scope;
            $http.get(API_URL + 'assigned')
                .success(function (response, status, headers, config) {
                    localScope.asts = response;
                    $("#aatbody").removeClass("loading");
                    if(response.length == 0) {
                        $scope.noAssetsMessage = "There are no assets Assigned to this consultant!";
                        return localScope.asts = response;
                    }
                    else {
                        return localScope.asts = $scope.asset;
                    }
                })
        }

        var imgIndex = 0;

        $scope.imgView = [];
        $scope.assetGalleryClick = function(id) {
            imgIndex = 0;
            $scope.numberOfAssetPics = "";
            $scope.imgView = _.filter($scope.imageURLforAsset, function (img) { return img.parentID === id });
            if($scope.imgView.length == 0){
                $scope.numberOfAssetPics = "There are no images for this asset";
                document.getElementById("galImg").outerHTML = "<img class='col-md-8' id='galImg' src='" + 'images/logo2.jpg' + "'/>";
            }
            else {
                $scope.numberOfAssetPics = imgIndex + 1 + " of " + $scope.imgView.length;
                document.getElementById("galImg").outerHTML = "<img class='col-md-8' id='galImg' src='" + $scope.imgView[0].url + "'/>";
            }
        }

     $scope.$on('$viewContentLoaded', function(){
        //Here your view content is fully loaded !!
      });

        $scope.next = function () {
            $("#galImg").css("display","none");
            imgIndex++;
            if(imgIndex >= $scope.imgView.length){
                imgIndex = 0;
            }
            document.getElementById("galImg").outerHTML= "<img class='col-md-8' id='galImg' src='"+$scope.imgView[imgIndex].url+"'/>";
            console.log($scope.imgView[imgIndex].url);
            $scope.numberOfAssetPics =imgIndex+1 + " of " + $scope.imgView.length;
        };

        $scope.prev = function() {
            imgIndex--;
            if(imgIndex < 0){
                imgIndex = $scope.imgView.length-1;
            }
            document.getElementById("galImg").src= $scope.imgView[imgIndex].url;
            $scope.numberOfAssetPics =imgIndex+1 + " of " + $scope.imgView.length;
        };

        $scope.$watch('newConsultant.practices', function () {
            $scope.pracs = _.filter($scope.practices, function (pr) { return pr.practiceID === $scope.newConsultant.practices.practiceIDF });

        });

        $scope.$watch('newConsultant.clients', function () {
            $scope.cli = _.filter($scope.clients, function (cl) { return cl.clientID === $scope.newConsultant.clients.clientID });

        });
        
        //SORT BY CLICKED COLUMN
        $scope.sortColumn = "";
        $scope.reverseSort = false;

        $scope.sortData = function(column){
            $scope.reverseSort = ($scope.sortColumn == column) ? !$scope.reverseSort : false;
            $scope.sortColumn = column;
        }
        
        $scope.getSortClass = function(column){
            if($scope.sortColumn == column){
                return $scope.reverseSort ? 'glyphicon glyphicon-triangle-bottom' : 'glyphicon glyphicon-triangle-top';
            }
            return 'glyphicon glyphicon-sort';
        }


        $scope.getAllConsultants();
    }]);