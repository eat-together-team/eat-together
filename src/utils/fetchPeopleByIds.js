import { db } from "../provider/Firebase";
import * as firebase from "firebase/compat";

// Looks up a set of Users docs by id, in Firestore's 'in'-query chunk size
// (10) — used anywhere a screen only has a list of uids (e.g. taggedUserIds
// on a photo) and needs the display info (name, hasImage) to go with them.
// Results aren't guaranteed to preserve `ids` order, and ids with no
// matching doc (deleted account, bad data) are silently dropped.
export const fetchPeopleByIds = async (ids) => {
  if (!ids || ids.length === 0) return [];

  const chunks = [];
  for (let i = 0; i < ids.length; i += 10) chunks.push(ids.slice(i, i + 10));

  const snapshots = await Promise.all(
    chunks.map((chunk) =>
      db.collection("Users").where(firebase.firestore.FieldPath.documentId(), "in", chunk).get()
    )
  );

  const people = [];
  snapshots.forEach((snapshot) =>
    snapshot.forEach((doc) => people.push({ id: doc.id, ...doc.data() }))
  );
  return people;
};
