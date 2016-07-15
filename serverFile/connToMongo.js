module.exports = {
    insert: insertToDb,
    find: findFromDb,
    findAll: findAllFromDb
}


function insertToDb(collection, element, callback)
{
    collection.insert(element, function (err, res) {
        if (err) {
            console.log('insertToDb error');
            console.log(err);
            if (callback != null) callback(err);
        } else {
            //console.log('********insert To db succeed*********');
            //console.log(res);
            if (callback != null) callback(null);
        }
    });
}

function insertAllToDb(collection, elemarray, callback) {
    var task = [];
    elemarray.forEach(function (item) {
        task.push(function (callb) {
            insertToDb(collection, item, function () {
                callb();
            });
        });
    });
    
    async.parallel(task, function (err, results) {
        if (err) callback(err, collection);
        else callback(null, collection);
    });
}

function findFromDb(collection, constraints, fields, callback)
{
    collection.find(constraints, fields).toArray(function (err, docs) {
        if (err) {
            console.log('findAllFromDb error');
            console.log(err);
            if (callback != null) callback(err);
        }
        else {
            if (callback != null) callback(null, docs);
        }
    });
}

function findAllFromDb(collection, callback)
{
    var result = [];
    collection.find().toArray(function (err, docs) {
        if (err) { console.log('findall error'); console.log(err); callback(err, null); }
        else {
            callback(null, docs);
        }
    });
}
