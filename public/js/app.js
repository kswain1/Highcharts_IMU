angular.module("contactsApp", ['ngRoute', 'angularMoment'])
    .config(function($routeProvider) {
        $routeProvider
            .when("/", {
                templateUrl: "list.html",
                controller: "ListController",
                resolve: {
                    contacts: function(Contacts) {
                        return Contacts.getContacts();
                    },
                    hips: function(Hips){
                        const hips =  Hips.getHips();
                        console.log(hips, 'log service');
                        return hips;
                    }
                }
            })
            .when("/new/contact", {
                controller: "NewContactController",
                templateUrl: "contact-form.html"
            })
            .when("/contact/:contactId", {
                controller: "EditContactController",
                templateUrl: "contact.html"
            })
            .when("/progress", {
                controller: "ChartController",
                templateUrl: "highcharts.html",
                resolve: {
                    contacts: function(Contacts) {
                        return Contacts.getContacts();
                    },
                    hips: function(Hips){
                        const hips =  Hips.getHips();
                        console.log(hips, 'log service');
                        return hips;
                    }
                }
            })
            .otherwise({
                redirectTo: "/"
            })
    })
    .service("Contacts", function($http) {
        this.getContacts = function() {
            return $http.get("/contacts").
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error finding contacts.");
                });
        }
        this.createContact = function(contact) {
            return $http.post("/contacts", contact).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error creating contact.");
                });
        }
        this.getContact = function(contactId) {
            var url = "/contacts/" + contactId;
            return $http.get(url).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error finding this contact.");
                });
        }
        this.editContact = function(contact) {
            var url = "/contacts/" + contact._id;
            console.log(contact._id);
            return $http.put(url, contact).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error editing this contact.");
                    console.log(response);
                });
        }
        this.deleteContact = function(contactId) {
            var url = "/contacts/" + contactId;
            return $http.delete(url).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error deleting this contact.");
                    console.log(response);
                });
        }
    })
    .service("Hips", function($http){
        this.getHips = function(){
            return $http.get("/hips")
                .then(function(response){
                    return response;
                }, function(error){
                    alert('Error getting Hips');
                    console.log(error)
                })
        }
    })
    .controller("ListController", function(contacts, hips, $scope) {
        $scope.contacts = contacts.data;
        const hipsObject = hips.data;
        $scope.contacts.map((contact, index) => {
            contact['hip_speed'] = hipsObject[index].swing_speed_mag;
            contact['createDate'] = moment(contact['createDate']).format('MM DD YYYY');
        })
        console.log($scope.contacts);
        console.log(moment, 'moment library');
    })
    .controller("ChartController", function(contacts, hips, $scope) {
        $scope.contacts = contacts.data;
        const hipsObject = hips.data;

        var hips1 = [], contacts1=[], startDate=new Date();
        $scope.contacts.map((contact, index) => {
            if(index===0){
                startDate = new Date(contact['createDate']);
            }
            contacts1.push(contact.swing_speed_mag ? contact.swing_speed_mag : 0);
        });
        hipsObject.map((hip, index) => {
            hips1.push(hip.swing_speed_mag ? hip.swing_speed_mag : 0);
        });

        Highcharts.chart('container', {

            title: {
                text: 'Swing Chart'
            },

            subtitle: {
                text: 'Xplosion Swing for the Fences'
            },

            yAxis: {
                title: {
                    text: 'Swing Speed'
                }
            },
            xAxis: {
                title: {
                    text: 'Number of Swings'
                }
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle'
            },

            plotOptions: {
                series: {
                    name: "Swing Count",
                    pointStart: 1
                }
            },

            series: [{
                name: 'Bat Speed',
                data: contacts1
            }, {
                name: 'Hip Speed',
                data: hips1
            }]

        });



        
        console.log($scope.contacts);
        console.log(moment, 'moment library');
    })

    .controller("NewContactController", function($scope, $location, Contacts) {
        $scope.back = function() {
            $location.path("#/");
        }

        $scope.saveContact = function(contact) {
            Contacts.createContact(contact).then(function(doc) {
                var contactUrl = "/contact/" + doc.data._id;
                $location.path(contactUrl);
            }, function(response) {
                alert(response);
            });
        }
    })
    .controller("EditContactController", function($scope, $routeParams, Contacts) {
        Contacts.getContact($routeParams.contactId).then(function(doc) {
            $scope.contact = doc.data;
        }, function(response) {
            alert(response);
        });

        $scope.toggleEdit = function() {
            $scope.editMode = true;
            $scope.contactFormUrl = "contact-form.html";
        }

        $scope.back = function() {
            $scope.editMode = false;
            $scope.contactFormUrl = "";
        }

        $scope.saveContact = function(contact) {
            Contacts.editContact(contact);
            $scope.editMode = false;
            $scope.contactFormUrl = "";
        }

        $scope.deleteContact = function(contactId) {
            Contacts.deleteContact(contactId);
        }
    });