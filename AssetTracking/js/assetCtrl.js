var myAsset = angular.module('myAsset', ['ngFileUpload'])

.directive( 'elemReady', function( $parse ) {
   return {
       restrict: 'A',
       link: function( $scope, elem, attrs ) {
          elem.ready(function(){
            $scope.$apply(function(){
                var func = $parse(attrs.elemReady);
                func($scope);
            })
          })
       }
    }
})

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

    .controller('assetCtrl', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http) {
        function assetCtrl($scope) {
            $scope.parentconsultants = $scope.cities;
        }


        var ASSET_TYPE_KEY='assetTypeV2';
        $scope.note = {};
        $scope.statuses = {};
        $scope.consult = {};
        $scope.newAsset = {};
        $scope.asset = [];
        $scope.assets = [];
        $scope.assetType = [];
        $scope.assetTypes = [];
        $scope.assigned = [];
        $scope.makes = [];
        $scope.accessories = [];
        $scope.models = [];
        $scope.status = [];
        $scope.singleStatus = [];
        $scope.practices = [];
        $scope.consultants = [];
        $scope.singleConsultant = [];
        $scope.practicesAndAll = [];
        $scope.history = [];
        $scope.imageURL = [];
        $scope.assetProfileImages = [];
        $scope.countA = 0;
        $scope.countC = 0;
        $scope.myInterval = 3000;
        $scope.galleryImages = [];
        $scope.assetMakes = [];
        var assetMakesList = [];


        var isLoggedIn = $.cookie("isSignedIn");
//        alert(isLoggedIn);
        if(!isLoggedIn){
            window.location.href = "login.html";
        }
        $scope.newAsset.date = new Date();

        if(typeof(Storage) !== "undefined") {
            if (localStorage.assetCount) {
                $scope.countA = localStorage.assetCount;
            }
            if (localStorage.consultantCount) {
                $scope.countC = localStorage.consultantCount;
            }
        };


        $scope.getAllAssets = function () {

       // $.cookie("assetCookie", 1);

            $http.get(API_URL + 'asset')
                .success(function (response, status, headers, config) {
                    $scope.assets = response;
                    $scope.asset = response;
                    $scope.defaultImageUrl = 'styles/images/image_not_available.png';
                    $scope.countA = $scope.assets.length;

                    if(typeof(Storage) !== "undefined") {
                        if (localStorage.assetCount) {
                            if(localStorage.assetCount != response.length){
                                localStorage.assetCount = response.length;
                               }
                        } else {
                            localStorage.assetCount = response.length;
                        }
                        $scope.countA = localStorage.assetCount;
                    } else {
                        $scope.countA = response.length;
                        console.error("This browser does't support local storage for assets")
                    }

                    angular.forEach($scope.asset, function(asset){
                        asset["propic"]="";
                        if(asset.imageURL.length > 0) {
                            angular.forEach(asset.imageURL, function(image){
                                image["url"] = image.uri;
                                image["parentID"] = asset.assetID;
                                image.uri="";
                                $scope.imageURL.push(image);
                                    if (image.imagesPriority === 1) {
                                        asset["propic"]=image.url;
                                        return;
                                    }
                            });
                        }
                        else {
                            asset.propic = 'styles/images/image_not_available.png';
                        }
                    });
                    $("#tablebody").removeClass("loading");
                    console.log($scope.asset);
                })
                .error(function (response) {
                    console.log(response);
                });


                $http.get(API_URL + 'assetMake')
                .success(function (response, status, headers, config){
                $scope.assetMakes = response.makeList;
                assetMakesList =response.makeList;


                })

            $http.get(API_URL + ASSET_TYPE_KEY)
                .success(function (response, status, headers, config) {
                    $scope.assetType = response.assetTypeList;
                   $scope.assetTypes =response.assetTypeList;
                   console.log('Asset types : '+$scope.assetTypes);
                  /*   $scope.accessories = _.filter(response, function (assetT) { return assetT.parentID === '-1' && assetT.isAccessory });*/
                })
                .error(function (response) {
                    console.log(response);
                });

            $http.get(API_URL + 'Consultant')
                .success(function (response, status, headers, config) {
                    $scope.consultants = response;
                    $scope.countC = $scope.consultants.length;

                    if(typeof(Storage) !== "undefined") {
                        if (localStorage.consultantCount) {
                            if(localStorage.consultantCount != $scope.consultants.length){
                                localStorage.consultantCount = $scope.consultants.length;
                               }
                        } else {
                            localStorage.consultantCount = $scope.consultants.length;
                        }
                        $scope.countC = localStorage.consultantCount;
                    } else {
                        $scope.countC = $scope.consultants.length;
                        console.error("This browser does't support local storage for consultants")
                    }
                })
                .error(function (response) {
                    console.log(response);
                })

            $http.get(API_URL + 'status')
                .success(function (response, status, headers, config) {
                    $scope.status = response.statusList;
                })

                .error(function (response) {
                    console.log(response);
                });

            $http.get(API_URL + 'Practice')
                .success(function (response, status, headers, config) {
                    $scope.practices = response.practiceList;
                    $scope.practicesAndAll = response.practiceList;
                })
                .error(function (response) {
                    console.log(response);
                });
        }

        $scope.createAsset = function () {
//assetMakes

//                $scope.newAsset.make = $
//                $scope.newAsset.assetTypeName = $('#assetTypes').select2("data")[0].text;
                 $scope.newAsset.assetMakeName = $('#assetMakes').select2("data")[0].text;
                 $scope.newAsset.assetMakeId = getMakeId($scope.newAsset.assetMakeName, assetMakesList);
                console.log("selected assettype : "+JSON.stringify($scope.newAsset));
                var newAssetCreated = {
                    practiceID:$scope.newAsset.practices.practiceID,
                    assetTypeID: $scope.newAsset.type.assetTypeID,
                    dateAcquired: $scope.newAsset.date.toISOString('GMT'),
                    assetDescription: $scope.newAsset.description,
//                    manufacturer: "-",
                    identifier: $scope.newAsset.models,
                    serialNumber: $scope.newAsset.serialNumber,
                 /*   assetMakeId:*/
                    assetTag: "DVT"+ $scope.newAsset.type.assetTypeName.substring(0,1),

                };
                var makeId =getMakeId($scope.newAsset.assetMakeName, assetMakesList);
                console.log("makeId : ");
                console.log(makeId);
                if(makeId!=null){
                    newAssetCreated.assetMakeId = makeId;
                    newAssetCreated.assetMakeName = "";

                }else{
                    newAssetCreated.assetMakeName =  $scope.newAsset.assetMakeName;
                }


                console.log("new Asset : "+ JSON.stringify(newAssetCreated));

            var url = $rootScope.pics;

            $.ajax({
                url:API_URL + 'asset',
                type:'POST',
                data: newAssetCreated,
                cache: false,
                success: function(msg){

                    if(url.length > 0) {
                        for (var i = 0; i < url.length; i++) {
                            var image = {
                                parentID: msg.assetID,
                                uri: url[i].url,
                                imagesPriority: i + 1
                            };

                            $.ajax({
                                url: API_URL + 'image',
                                type: 'POST',
                                data: image,
                                cache: false,
                                success: function (res) {
                                        hideButtonSpinner()
                                        location.reload();
//                                 location.reload();

                                    console.log(JSON.stringify(res))
                                }, error: function (res) {
                                    console.log(res);
                                }
                            });
                        }
                    }
                    console.log("Asset Created: " + JSON.stringify(msg));



//                    successful();
             },
//                error: function(msg){
//                    alert(msg)
//                }
            });
        };

       //gallery controls
        var imgIndex = 0;

        $scope.imgView = [];
        $scope.assetGalleryClick = function(id) {
            imgIndex = 0;
            $scope.numberOfAssetPics = "";
            $scope.imgView = _.filter($scope.imageURL, function (img) { return img.parentID === id });
            if($scope.imgView.length == 0){
                $scope.numberOfAssetPics = "There are no images for this asset";
                document.getElementById("galImg").outerHTML = "<img class='col-md-8' id='galImg' src='" + $scope.defaultImageUrl + "'/>";
            }
            else {
                $scope.numberOfAssetPics = imgIndex + 1 + " of " + $scope.imgView.length;
                document.getElementById("galImg").outerHTML = "<img class='col-md-8' id='galImg' src='" + $scope.imgView[0].url + "'/>";
            }
        }


        $scope.next = function () {
            $("#galImg").css("display","none");


            imgIndex++;

            if($scope.imgView.length == 0)
            {
                           document.getElementById("galImg").outerHTML= "<img class='col-md-8' id='galImg' src='"+$scope.defaultImageUrl+"'/>";
             }
            if(imgIndex >= $scope.imgView.length){
                imgIndex = 0;
            }


            document.getElementById("galImg").outerHTML= "<img class='col-md-8' id='galImg' src='"+$scope.imgView[imgIndex].url+"'/>";
            console.log($scope.imgView[imgIndex].url);
            $scope.numberOfAssetPics =imgIndex+1 + " of " + $scope.imgView.length;
            $scope.$digest();
        };

         $scope.prev = function() {
            imgIndex--;

            if($scope.imgView.length == 0){
                       document.getElementById("galImg").outerHTML= "<img class='col-md-8' id='galImg' src='"+$scope.defaultImageUrl+"'/>";
                       }
            if(imgIndex < 0){
                imgIndex = $scope.imgView.length-1;
            }
            document.getElementById("galImg").src= $scope.imgView[imgIndex].url;
             $scope.numberOfAssetPics =imgIndex+1 + " of " + $scope.imgView.length;
             $scope.$digest();
        };

        $scope.viewAssetClick = function(id) {
             $("#consultSelect option").eq(0).prop('selected', true);
            // $("#statusSelect")[0].prop('selected', true);
            $("#updateButton").prop('disabled', false);
            $("#htbody").addClass("loading");
            $scope.updateSuccessful = "";
            $scope.noMessage = "";
            $scope.viewAsset = _.find($scope.assets, function (asset) { return asset.assetID === id });

            var localScope = $scope;
            $http.get(API_URL + 'asset/history/'+ id)
                .success(function (response, status, headers, config) {
                    $("#htbody").removeClass("loading");
                    if(response.length == 0) {
                        $scope.noAssetsMessage = "There are no assets Assigned to this consultant!";
                        return localScope.historys = response;
                    }
                    else {
                        return localScope.historys = response;

                    }
                })
        }

        $scope.$watch('newAsset.type', function () {
          $scope.makes = _.filter($scope.assetType, function (assetT) { return true });

        });

        $scope.$watch('newAsset.make', function () {
           $scope.models = _.filter($scope.assetType, function (assetT) { return true});

        });
        $scope.$watch('statuses.status', function () {
            $scope.singleStatus = _.filter($scope.status, function (stat) { return stat.statusID === $scope.statuses.status.statusID });

        });

        $scope.$watch('consult.consultants', function () {
            $scope.singleConsultant = _.filter($scope.consultants, function (consultant) { return consultant.constantID === $scope.consult.consultants.consultantID});

        });

          $scope.$watch('note.eventNotes', function () {
                    $scope.singleEventNotes = _.filter($scope.eventNotes, function (not) { return not.eventNotes === $scope.note.eventNotes});

                });

       document.onkeydown = function(e) {
           e = e || window.event;
           switch(e.which || e.keyCode) {
               case 37: // left

               $scope.prev();
               break;

               case 39: // right

               $scope.next();
               break;

               default: return; // exit this handler for other keys
           }
          // e.preventDefault(); // prevent the default action (scroll / move caret)
       };

        //Filter by header dropdowns
        //practices
        $scope.practiceFilter = {};
        $scope.filterByPractice = function(practiceName) {
        if(practiceName.length == 0){
                $scope.NoAssetMsg = "no asset";
                  return ( successful())
                               }

          if (practiceName === 'All') {
            $scope.practiceFilter = {};
          }
          else {
            $scope.practiceFilter.practiceName = practiceName;

          }
        };


        //types
        $scope.typeFilter = {};
        $scope.filterByType = function(typeName) {
          if (typeName === 'All') {
            $scope.typeFilter = {};
          }
          else {
            $scope.typeFilter.assetTypeName = typeName;
          }
        };

        $scope.updateAsset = function () {

            $scope.updateSuccessful = "";
            if($scope.consult != null){
                var update = {
                    assetID: $scope.viewAsset.assetID,
                    statusID: $scope.statuses.status.statusID,
                    consultantID: $scope.consult.consultants.consultantID,
                    eventNotes: $scope.note.eventNotes
                };
            }
            else    {
                var update = {
                    assetID: $scope.viewAsset.assetID,
                    statusID: $scope.statuses.statusID,
                    eventNotes: $scope.note.eventNotes
                };
            }

            $.ajax({
                url: API_URL +'assigned',
                type:'POST',
                data: update,
                cache: false,
                success: function(msg){
                    $scope.viewAssetClick($scope.viewAsset.assetID);
                    $scope.updateSuccessful = "successfully assigned to "+ $scope.consult.consultants.name;
                    $("#updateButton").prop('dsisabled', true);
                    //location.reload();
                },
                error: function(msg){
                    alert(msg)
                }
            });

        }

        $scope.reloadRoute = function(){
            location.reload();
        }


//        //SORT BY CLICKED COLUMN
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

        $scope.getAllAssets();
    }])

    .controller('AppController', ['$scope', '$rootScope', '$http', 'Upload','$timeout', function($scope, $rootScope, $http, Upload, $timeout) {


        $rootScope.pics = [];
        var pictures;
        var count ;
        /*$scope.getTheFiles = function ($files) {
            angular.forEach($files, function (value, key) {
                formdata.append(key, value);
            });
        };*/

        $(document).ready(function() {
        /*$('#fileUpload').fileUpload({
            maxNumberOfFiles: 8
            maxFileSize: 1024
            acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i
        });*/
            $("#fileUpload").on('change', function() {
                $scope.successMsg = "";
                //Get count of selected files
                var files = $(this)[0].files;
                pictures = files;
                var countFiles = $(this)[0].files.length;
                count = countFiles;
                var imgPath = $(this)[0].value;
                var extn = imgPath.substring(imgPath.lastIndexOf('.') + 1).toLowerCase();
                var image_holder = $("#image-holder");
                image_holder.empty();
                if (extn == "gif" || extn == "png" || extn == "jpg" || extn == "jpeg") {
                    $("#uploadButton").prop('disabled', false);
                    if (typeof(FileReader) != "undefined") {
                        //loop for each file selected for uploaded.


                        for (var i = 0; i < countFiles; i++)
                        {
                            var reader = new FileReader();
                            reader.onload = function(e) {
                                $("<img />", {
                                    "src": e.target.result,
                                    "class": "thumb-image"
                                }).appendTo(image_holder);
                            }
                            image_holder.show();
                            reader.readAsDataURL($(this)[0].files[i]);

                        }
                    } else {
                        alert("This browser does not support FileReader.");

                    }
                } else {
                    $("#uploadButton").prop('disabled', true);
                    $scope.successMsg = "Pls select only images";

                }

            });


            $scope.uploadImages = function(){
            $("#uploadButton").prop('disabled', true);
                $("#progress").removeClass("progressHide");
                $("#progress").addClass("progressShow");
                for(var i = 0; i< count; i++)
                {
                var formdata = new FormData();
                formdata.append(i, pictures[i]);
                    var request = {
                        method: 'POST',
                        url: API_URL + 'upload',
                        data: formdata,
                        headers: {
                            'Content-Type': undefined
                        }
                    };

                    $scope.successMsg = "";
                    // SEND THE FILES.
                    $http(request).success(function (response, evt) {
                          $("#progress").removeClass("progressShow");
                           $("#progress").addClass("progressHide");
                            $scope.successMsg = "Images Uploaded Successfully!";
                            $timeout(function () {
                                $scope.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                                formdata.result = response.data;
                                $rootScope.pics.push(response);
                                console.log(response);
                            });


                        }, function (response) {
                            if (response.status > 0)
                                $scope.errorMsg = response.status + ': ' + response.data;
                        }, function (evt) {
                            // Math.min is to fix IE which reports 200% sometimes
                            $scope.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                        })
                        .error(function (d) {
                            console.log(d);
                        });

                }
                // myService.updateVal('pics', $scope.pics);
            }
        });


    }]);