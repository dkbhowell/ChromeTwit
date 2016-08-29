
function sortByKey(ray, sortKey, desc){
    if (!ray || !sortKey){
        return null;
    }

    var sortFunc = function (a, b) {
        a = a[sortKey];
        b = b[sortKey];
        if (a < b){return -1;}
        if (a > b){return 1;}
        return 0;
    };

    if(desc === true){
        sortFunc = function(a, b){
            a = a[sortKey];
            b = b[sortKey];
            if (a > b){return -1;}
            if (a < b){return 1;}
            return 0;
        }
    }

    ray.sort(sortFunc)

}

var randomString = function(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

function Kvp(key, val){
    this.key = key;
    this.value = val;
}

exports.sortByKey = sortByKey;
exports.randomString = randomString;
exports.Kvp = Kvp;


// Testing
var testRay = [{key : "Key2",value : "Value2"}, {key : "Key1",value : "Value1"},
    {key : "Key3",value : "Value3"}, {key : "Key4",value : "Value4"}];

console.log("Unsorted");
console.log(testRay);

sortByKey(testRay, 'key');

console.log("Sorted");
console.log(testRay);