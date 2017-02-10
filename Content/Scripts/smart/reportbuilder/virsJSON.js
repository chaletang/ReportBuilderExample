var dataJSON = {
    defaultSubjectJSON: [
            {
                Name: "Subject1",
                Description: "This is 1 subject",
                Dimensions: [
                            {
                                Name: "name",
                                Description: "",
                                Values: ["Anny1", "Lily1", "Mike1"]
                            },
                            {
                                Name: "birthDay",
                                Description: "",
                                Values: ["1988", "1977", "1966"]
                            },
                            {
                                Name: "sex",
                                Description: "",
                                Values: ["male", "female"]
                            }

                ],
                Measures: [
                            {
                                Name: "salary",
                                Description: "",
                                Values: ["2000", "3000", "4000"]
                            },
                            {
                                Name: "stature",
                                Description: "",
                                Values: ["160", "162", "177"]
                            },
                            {
                                Name: "weight",
                                Description: "",
                                Values: ["50", "60", "70"]
                            }
                ]
            },
            {
                Name: "Subject2",
                Description: "This is 2 subject",
                Dimensions: [
                           {
                               Name: "address",
                               Description: "",
                               Values: ["Nanjing", "Beijing", "Shanghai"]
                           },
                           {
                               Name: "hobby",
                               Description: "",
                               Values: ["Sing", "Dance", "Read"]
                           },
                           {
                               Name: "major",
                               Description: "",
                               Values: ["Finance", "Resource", "Network"]
                           }

                ],
                Measures: [
                            {
                                Name: "age",
                                Description: "",
                                Values: ["20", "25", "30"]
                            },
                            {
                                Name: "family",
                                Description: "",
                                Values: ["3", "4", "5"]
                            },
                            {
                                Name: "children",
                                Description: "",
                                Values: ["0", "1", "2"]
                            }
                ]
            },
            {
                Name: "Subject3",
                Description: "This is 3 subject",
                Dimensions: [
                           {
                               Name: "company",
                               Description: "",
                               Values: ["Pwc", "IBM", "HP"]
                           },
                           {
                               Name: "transport",
                               Description: "",
                               Values: ["bicycle", "motorbike", "bus", "tax"]
                           },
                           {
                               Name: "department",
                               Description: "",
                               Values: ["IT", "ADT", "SAP", "HR"]
                           }

                ],
                Measures: [
                            {
                                Name: "workhour",
                                Description: "",
                                Values: ["8", "10", "6"]
                            },
                            {
                                Name: "distance",
                                Description: "",
                                Values: ["1600", "1162", "1779"]
                            },
                            {
                                Name: "bonus",
                                Description: "",
                                Values: ["2000", "3260", "2770"]
                            }
                ]
            }
    ],
    currentSubjectJSON: [
            {
                Name: "Subject1",
                Description: "This is 1 subject",
                Dimensions: [
                            {
                                Name: "name",
                                Description: "",
                                Values: ["Anny1", "Lily1", "Mike1"]
                            },
                            {
                                Name: "birthDay",
                                Description: "",
                                Values: ["1988", "1977", "1966"]
                            },
                            {
                                Name: "sex",
                                Description: "",
                                Values: ["male", "female"]
                            }

                ],
                Measures: [
                            {
                                Name: "salary",
                                Description: "",
                                Values: ["2000", "3000", "4000"]
                            },
                            {
                                Name: "stature",
                                Description: "",
                                Values: ["160", "162", "177"]
                            },
                            {
                                Name: "weight",
                                Description: "",
                                Values: ["50", "60", "70"]
                            }
                ]
            },
            {
                Name: "Subject2",
                Description: "This is 2 subject",
                Dimensions: [
                           {
                               Name: "address",
                               Description: "",
                               Values: ["Nanjing", "Beijing", "Shanghai"]
                           },
                           {
                               Name: "hobby",
                               Description: "",
                               Values: ["Sing", "Dance", "Read"]
                           },
                           {
                               Name: "major",
                               Description: "",
                               Values: ["Finance", "Resource", "Network"]
                           }

                ],
                Measures: [
                            {
                                Name: "age",
                                Description: "",
                                Values: ["20", "25", "30"]
                            },
                            {
                                Name: "family",
                                Description: "",
                                Values: ["3", "4", "5"]
                            },
                            {
                                Name: "children",
                                Description: "",
                                Values: ["0", "1", "2"]
                            }
                ]
            },
            {
                Name: "Subject3",
                Description: "This is 3 subject",
                Dimensions: [
                           {
                               Name: "company",
                               Description: "",
                               Values: ["Pwc", "IBM", "HP"]
                           },
                           {
                               Name: "transport",
                               Description: "",
                               Values: ["bicycle", "motorbike", "bus", "tax"]
                           },
                           {
                               Name: "department",
                               Description: "",
                               Values: ["IT", "ADT", "SAP", "HR"]
                           }

                ],
                Measures: [
                            {
                                Name: "workhour",
                                Description: "",
                                Values: ["8", "10", "6"]
                            },
                            {
                                Name: "distance",
                                Description: "",
                                Values: ["1600", "1162", "1779"]
                            },
                            {
                                Name: "bonus",
                                Description: "",
                                Values: ["2000", "3260", "2770"]
                            }
                ]
            }
    ]
};

var chartJSON = [
                {
                    "name": "Joe", "birthDay": "1989", "sex": "male",
                    "stature": 170, "weight": 50, "salary": 3000,
                    "address": "Shanghai", "hobby": "Read", "major": "Finance",
                    "age": 25, "family": 3, "children": 2,
                    "company": "PWC", "transport": "bicycle", "department": "IT",
                    "workhour": 8, "distance": 1650, "bonus": 2000
                }
                , {
                    "name": "Anny", "birthDay": "1987", "sex": "female",
                    "stature": 1640, "weight": 60, "salary": 5000,
                    "address": "Nanjing", "hobby": "Sing", "major": "Network",
                    "age": 27, "family": 5, "children": 0,
                    "company": "HP", "transport": "bus", "department": "ADT",
                    "workhour": 10, "distance": 1162, "bonus": 3260
                }
];
var tempViewJSON = [
            {
                "name": "Joe", "birthDay": "1991",
                "stature": 170, "weight": 50, "salary": 2500,
                "address": "Shanghai", "hobby": "Read", "major": "Finance",
                "age": 39, "family": 2, "children": 0,
                "company": "PWC", "transport": "bicycle", "department": "IT",
                "workhour": 8, "distance": 1100, "bonus": 2900
            }
            , {
                "name": "Anny", "birthDay": "1966",
                "stature": 166, "weight": 70, "salary": 1200,
                "address": "Nanjing", "hobby": "Sing", "major": "Network",
                "age": 35, "family": 5, "children": 3,
                "company": "HP", "transport": "bus", "department": "ADT",
                "workhour": 10, "distance": 1462, "bonus": 3560
            },
            {
                "name": "Eric", "birthDay": "1978",
                "stature": 173, "weight": 52, "salary": 4400,
                "address": "Shanghai", "hobby": "Read", "major": "Finance",
                "age": 28, "family": 4, "children": 2,
                "company": "IBM", "transport": "car", "department": "SAP",
                "workhour": 6, "distance": 3300, "bonus": 6700
            },
            {
                "name": "Mike", "birthDay": "1988",
                "stature": 165, "weight": 45, "salary": 5300,
                "address": "Shanghai", "hobby": "Read", "major": "Finance",
                "age": 22, "family": 3, "children": 2,
                "company": "CA", "transport": "walk", "department": "HR",
                "workhour": 8, "distance": 1200, "bonus": 5500
            },
            {
                "name": "Sam", "birthDay": "1985",
                "stature": 175, "weight": 62, "salary": 6200,
                "address": "Shanghai", "hobby": "Read", "major": "Finance",
                "age": 32, "family": 5, "children": 2,
                "company": "Dell", "transport": "air", "department": "Finance",
                "workhour": 9, "distance": 1900, "bonus": 7000
            }
];