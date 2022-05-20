/* open the required database version */
let database = indexedDB.open("crescendo-projects-database", 1);
/* check if the database needs to update*/
database.addEventListener("upgradeneeded", function(event) {
	let db = event.target.result;
	console.log(`Your database is being upgraded from ${event.oldVersion} to ${event.newVersion}`);
	/* expected object stores the database should have */
	let expectedStores = ["projects"];
	for (let i = 0; i < expectedStores.length; i++) {
		/* if the database doesn't have the store, then add it */
		if (db.objectStoreNames.contains(expectedStores[i]) === false) {
			db.createObjectStore(expectedStores[i], {
				keyPath: "name",
			});
		}
	}
});
/* error check */
database.addEventListener("error", function(event) {
	throw new Error(`Attempt to open database failed due to ${event.target.error}`);
});

/* useful method to simplify database transactions */
function getObjectStore(database, store, mode) {
	let transaction = database.transaction(store, mode);
	return transaction.objectStore(store);
}