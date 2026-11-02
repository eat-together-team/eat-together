// Create offer / Create request. `route.params.postType` is "offer" | "request".
// The app bar checkmark submits; an incomplete form shows the error banner
// instead, and a successful post shows "Offer posted!" / "Request posted!".

import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Layout, useTheme } from "../../../rapi_ui_components";

import SmallAppBar from "../../../components/SmallAppBar";
import Dialog from "../../../components/Dialog";
import DialogOverlay from "../../../components/DialogOverlay";
import SubBodyText from "../../../components/typography/SubBodyText";
import DollarsPostForm, { EMPTY_DOLLARS_FORM } from "./DollarsPostForm";

import { colorTokens } from "../../../theme/colorTokens";
import { db, auth } from "../../../provider/Firebase";
import { buildDollarsPostDocument, commitNewDiningDollarsPost, isDollarsPostFormComplete } from "./dollarsPostSchema";

export default function ({ navigation, route }) {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const user = auth.currentUser;
  const postType = route.params?.postType === "request" ? "request" : "offer";
  const isOffer = postType === "offer";

  const [form, setForm] = useState(EMPTY_DOLLARS_FORM);
  const [showInvalid, setShowInvalid] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [posted, setPosted] = useState(false);

  const updateForm = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const submit = async () => {
    if (submitting) return;
    if (!isDollarsPostFormComplete(form)) {
      setShowInvalid(true);
      return;
    }
    setShowInvalid(false);
    setSubmitting(true);
    try {
      const me = (await db.collection("Users").doc(user.uid).get()).data() || {};
      const postDoc = buildDollarsPostDocument({
        ...form,
        postType,
        postStartDate: new Date(),
        ownerID: user.uid,
        ownerDisplayName: `${me.firstName || ""} ${me.lastName || ""}`.trim(),
        ownerPhotoUrl: me.image || "",
      });
      await commitNewDiningDollarsPost(db, postDoc, user.uid);
      setPosted(true);
    } catch (error) {
      alert("Couldn't post: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <SmallAppBar
        title={isOffer ? "Create offer" : "Create request"}
        onBack={() => navigation.goBack()}
        actions={[{ icon: "checkmark", onPress: submit }]}
      />

      <DollarsPostForm
        form={form}
        onChange={updateForm}
        invalidMessage={
          showInvalid ? `You must fill out all fields to create ${isOffer ? "an offer" : "a request"}` : ""
        }
      />

      <DialogOverlay visible={posted} onDismiss={() => navigation.goBack()}>
        <Dialog
          type="Informative"
          title={isOffer ? "Offer posted!" : "Request posted!"}
          icon={<Ionicons name="checkmark-circle-outline" size={40} color={tokens.primary} />}
          primaryButtonText="Close"
          onPrimaryPress={() => navigation.goBack()}
        >
          <SubBodyText color={tokens.onBackground} center>
            You can find it under Active exchanges, in My posts.
          </SubBodyText>
        </Dialog>
      </DialogOverlay>
    </Layout>
  );
}
