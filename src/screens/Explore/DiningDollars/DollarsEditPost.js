// Edit offer / Edit request: same form as Create, with save (checkmark) and
// delete (trash) in the app bar. Leaving with unsaved changes — back button,
// Android back, or swipe — asks "Discard changes?" first.

import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Layout, useTheme } from "../../../rapi_ui_components";

import SmallAppBar from "../../../components/SmallAppBar";
import Dialog from "../../../components/Dialog";
import DialogOverlay from "../../../components/DialogOverlay";
import InformationCard from "../../../components/InformationCard";
import SubBodyText from "../../../components/typography/SubBodyText";
import DollarsPostDetailSkeleton from "../../../components/DiningDollars/DollarsPostDetailSkeleton";
import DollarsPostForm from "./DollarsPostForm";

import { colorTokens } from "../../../theme/colorTokens";
import { db, auth } from "../../../provider/Firebase";
import {
  DINING_DOLLARS_POSTS_COLLECTION,
  buildDollarsPostUpdatePayload,
  dollarsPostToManageFormState,
  isDollarsPostFormComplete,
} from "./dollarsPostSchema";
import { deleteDiningDollarsPost } from "./dollarsClaims";

const sameForm = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export default function ({ navigation, route }) {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const user = auth.currentUser;
  const { postId } = route.params;

  const [postType, setPostType] = useState("offer");
  const [initialForm, setInitialForm] = useState(null);
  const [form, setForm] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [showInvalid, setShowInvalid] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dialog, setDialog] = useState(null); // null | "discard" | "delete"
  const pendingLeaveAction = useRef(null);
  const allowLeave = useRef(false);

  const isOffer = postType === "offer";
  const dirty = !!form && !!initialForm && !sameForm(form, initialForm);

  useEffect(() => {
    db.collection(DINING_DOLLARS_POSTS_COLLECTION)
      .doc(postId)
      .get()
      .then((doc) => {
        if (!doc.exists || doc.data().ownerID !== user.uid) {
          setLoadError(true);
          return;
        }
        const { postType: type, ...state } = dollarsPostToManageFormState(doc.data());
        setPostType(type);
        setInitialForm(state);
        setForm(state);
      })
      .catch(() => setLoadError(true));
  }, [postId]);

  // Native-stack swipe-back can't be intercepted, so turn it off while dirty
  // and let beforeRemove catch the app bar / hardware back instead.
  useEffect(() => {
    navigation.setOptions({ gestureEnabled: !dirty });
  }, [dirty]);

  useEffect(
    () =>
      navigation.addListener("beforeRemove", (e) => {
        if (!dirty || allowLeave.current) return;
        e.preventDefault();
        pendingLeaveAction.current = e.data.action;
        setDialog("discard");
      }),
    [navigation, dirty]
  );

  const leave = (action) => {
    allowLeave.current = true;
    if (action) navigation.dispatch(action);
    else navigation.goBack();
  };

  const updateForm = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const save = async () => {
    if (busy || !form) return;
    if (!isDollarsPostFormComplete(form)) {
      setShowInvalid(true);
      return;
    }
    setShowInvalid(false);
    setBusy(true);
    try {
      await db.collection(DINING_DOLLARS_POSTS_COLLECTION).doc(postId).update(buildDollarsPostUpdatePayload(form));
      leave();
    } catch (error) {
      alert("Couldn't save: " + error.message);
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    setDialog(null);
    setBusy(true);
    try {
      await deleteDiningDollarsPost(db, postId, user.uid);
      allowLeave.current = true;
      // The detail screen behind this one would only show "deleted", so go
      // straight back to the exchange.
      navigation.navigate("DollarsExchange");
    } catch (error) {
      alert("Couldn't delete: " + error.message);
      setBusy(false);
    }
  };

  const title = isOffer ? "Edit offer" : "Edit request";

  if (loadError) {
    return (
      <Layout>
        <SmallAppBar title={title} onBack={() => navigation.goBack()} />
        <View style={styles.message}>
          <InformationCard type="Error" text="This post can't be edited. It may have been deleted." />
        </View>
      </Layout>
    );
  }

  return (
    <Layout>
      <SmallAppBar
        title={title}
        onBack={() => navigation.goBack()}
        actions={
          form
            ? [
                { icon: "checkmark", onPress: save },
                { icon: "trash-outline", onPress: () => !busy && setDialog("delete") },
              ]
            : []
        }
      />

      {form ? (
        <DollarsPostForm
          form={form}
          onChange={updateForm}
          invalidMessage={showInvalid ? `You must fill out all fields to save your ${postType}` : ""}
        />
      ) : (
        <DollarsPostDetailSkeleton />
      )}

      <DialogOverlay visible={dialog === "discard"} onDismiss={() => setDialog(null)}>
        <Dialog
          type="Destructive"
          title="Discard changes?"
          primaryButtonText="Discard changes"
          secondaryButtonText="Back"
          onPrimaryPress={() => {
            setDialog(null);
            leave(pendingLeaveAction.current);
          }}
          onSecondaryPress={() => setDialog(null)}
        >
          <SubBodyText color={tokens.onBackground} center>
            Your edits to this {postType} won't be saved.
          </SubBodyText>
        </Dialog>
      </DialogOverlay>

      <DialogOverlay visible={dialog === "delete"} onDismiss={() => setDialog(null)}>
        <Dialog
          type="Destructive"
          title={isOffer ? "Delete offer?" : "Delete request?"}
          primaryButtonText="Delete"
          secondaryButtonText="Back"
          onPrimaryPress={confirmDelete}
          onSecondaryPress={() => setDialog(null)}
        >
          <SubBodyText color={tokens.onBackground} center>
            This can't be undone. Anyone who asked to {isOffer ? "claim" : "fulfill"} it will no longer see it.
          </SubBodyText>
        </Dialog>
      </DialogOverlay>
    </Layout>
  );
}

const styles = StyleSheet.create({
  message: {
    padding: 20,
  },
});
