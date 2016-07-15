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
            if (callback != null) callback(err, res);
        } else {
            //console.log('********insert To db succeed*********');
            //console.log(res);
            if (callback != null) callback(null, null);
        }
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
        if (err) { console.log('findall error'); console.log(err); callback(null); }
        else {
            callback(docs);
        }
    });
}
