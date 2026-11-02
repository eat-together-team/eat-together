// Offer / Request in detail. One screen for both post types and both sides:
//   - Claimant: request -> pending (cancel with X) -> ready (chat, complete, cancel).
//   - Poster: pick one pending claimer to accept -> ready (chat, complete, cancel).

import React, { useEffect, useMemo, useState } from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Layout, useTheme } from "../../../rapi_ui_components";

import SmallAppBar from "../../../components/SmallAppBar";
import LargeButton from "../../../components/LargeButton";
import OutlinePillButton from "../../../components/OutlinePillButton";
import InformationCard from "../../../components/InformationCard";
import ProfilePic from "../../../components/ProfilePic";
import Dialog from "../../../components/Dialog";
import DialogOverlay from "../../../components/DialogOverlay";
import Header2Text from "../../../components/typography/Header2Text";
import Header4Text from "../../../components/typography/Header4Text";
import BodyText from "../../../components/typography/BodyText";
import SubBodyText from "../../../components/typography/SubBodyText";
import DollarsPostChip from "../../../components/DiningDollars/DollarsPostChip";
import DollarsPaymentBadges from "../../../components/DiningDollars/DollarsPaymentBadges";
import DollarsPostDetailSkeleton from "../../../components/DiningDollars/DollarsPostDetailSkeleton";

import { colorTokens } from "../../../theme/colorTokens";
import { radiusTokens } from "../../../theme/radiusTokens";
import { db, auth } from "../../../provider/Firebase";
import formatRelativeTime from "../../../utils/formatRelativeTime";
import {
  DINING_DOLLARS_POSTS_COLLECTION,
  POST_STATUS,
  dollarsPostHeadline,
  formatAvailableUntil,
  isDollarsPostExpired,
  toDate,
} from "./dollarsPostSchema";
import {
  CLAIM_STATUS,
  DOLLARS_CLAIMS_SUBCOLLECTION,
  viewerChipVariant,
  dollarsClaimsQuery,
  requestDollarsClaim,
  cancelDollarsClaim,
  acceptDollarsClaim,
  completeDollarsExchange,
} from "./dollarsClaims";
import { getDollarsLocation, getDollarsPaymentMethod } from "./dollarsConstants";
import { openDollarsExchangeChat } from "./dollarsChat";

const LOCATIONS_SHOWN = 5;
const DAY = 24 * 60 * 60 * 1000;

const firstName = (displayName) => (displayName || "").split(" ")[0];

const daysLeftLabel = (post) => {
  const expiresAt = toDate(post.expiresAt);
  if (!expiresAt) return "";
  const endOfDay = new Date(expiresAt);
  endOfDay.setHours(23, 59, 59, 999);
  const days = Math.ceil((endOfDay - new Date()) / DAY);
  if (days <= 1) return "Last day";
  return `${days} days left`;
};

const Section = ({ title, tokens, children }) => (
  <View style={styles.section}>
    <Header4Text color={tokens.textMedium}>{title}</Header4Text>
    {children}
  </View>
);

export default function ({ navigation, route }) {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const insets = useSafeAreaInsets();
  const user = auth.currentUser;
  const { postId } = route.params;

  const [post, setPost] = useState(null);
  const [postMissing, setPostMissing] = useState(false);
  const [myClaim, setMyClaim] = useState(null); // claimant side
  const [claims, setClaims] = useState([]); // poster side
  const [busy, setBusy] = useState(false);
  const [showAllLocations, setShowAllLocations] = useState(false);
  const [dialog, setDialog] = useState(null); // null | "cancelExchange" | "completed"

  const isOwner = post?.ownerID === user.uid;
  const isOffer = post?.postType !== "request";

  useEffect(() => {
    const unsubscribe = db
      .collection(DINING_DOLLARS_POSTS_COLLECTION)
      .doc(postId)
      .onSnapshot((doc) => {
        if (!doc.exists) {
          setPostMissing(true);
          return;
        }
        setPost({ id: doc.id, ...doc.data() });
      });
    return () => unsubscribe();
  }, [postId]);

  // Claimant: just my own claim doc. Poster: every claim on the post.
  useEffect(() => {
    if (!post) return;
    if (post.ownerID === user.uid) {
      const unsubscribe = dollarsClaimsQuery(db, postId).onSnapshot((query) => {
        setClaims(query.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsubscribe();
    }
    const unsubscribe = db
      .collection(DINING_DOLLARS_POSTS_COLLECTION)
      .doc(postId)
      .collection(DOLLARS_CLAIMS_SUBCOLLECTION)
      .doc(user.uid)
      .onSnapshot((doc) => setMyClaim(doc.exists ? doc.data() : null));
    return () => unsubscribe();
  }, [post?.ownerID, postId]);

  const pendingClaims = useMemo(() => claims.filter((c) => c.status === CLAIM_STATUS.PENDING), [claims]);
  const acceptedClaim = useMemo(
    () => claims.find((c) => c.claimantID === post?.acceptedClaimantID) || null,
    [claims, post?.acceptedClaimantID]
  );

  // Runs a claim action with the button in its loading state; errors surface as an alert.
  const run = async (action) => {
    setBusy(true);
    try {
      await action();
    } catch (error) {
      alert(error.message);
    } finally {
      setBusy(false);
    }
  };

  const requestClaim = () =>
    run(async () => {
      const me = (await db.collection("Users").doc(user.uid).get()).data() || {};
      await requestDollarsClaim(db, postId, {
        uid: user.uid,
        displayName: `${me.firstName || ""} ${me.lastName || ""}`.trim(),
        photoUrl: me.image || "",
      });
    });

  const withdrawClaim = () => run(() => cancelDollarsClaim(db, postId, user.uid));

  const acceptClaim = (claimantID) => run(() => acceptDollarsClaim(db, postId, claimantID));

  const otherPartyID = isOwner ? post?.acceptedClaimantID : post?.ownerID;
  const otherPartyName = isOwner ? acceptedClaim?.claimantDisplayName : post?.ownerDisplayName;

  const openChat = () => run(() => openDollarsExchangeChat(navigation, user.uid, otherPartyID));

  const markComplete = () =>
    run(async () => {
      await completeDollarsExchange(db, postId);
      setDialog("completed");
    });

  const cancelExchange = () => {
    setDialog(null);
    run(() => cancelDollarsClaim(db, postId, post.acceptedClaimantID));
  };

  if (postMissing) {
    return (
      <Layout>
        <SmallAppBar title="" onBack={() => navigation.goBack()} />
        <View style={styles.content}>
          <InformationCard text="This post has been deleted." />
        </View>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <SmallAppBar title="" onBack={() => navigation.goBack()} />
        <DollarsPostDetailSkeleton />
      </Layout>
    );
  }

  const locations = (post.preferredLocations || []).map(getDollarsLocation).filter(Boolean);
  const shownLocations = showAllLocations ? locations : locations.slice(0, LOCATIONS_SHOWN);
  const payments = (post.paymentMethods || []).map(getDollarsPaymentMethod).filter(Boolean);
  const expired = isDollarsPostExpired(post);
  const isReady = post.status === POST_STATUS.MATCHED && (isOwner || post.acceptedClaimantID === user.uid);
  const verb = isOffer ? "claim" : "fulfill";

  const renderClaimantFooter = () => {
    if (isReady) return renderReadyFooter(`Chat with ${firstName(post.ownerDisplayName)} to ${verb}`);

    if (myClaim?.status === CLAIM_STATUS.PENDING) {
      return (
        <View style={styles.pendingRow}>
          <LargeButton color="gray" disabled style={styles.pendingButton}>
            Request pending
          </LargeButton>
          <TouchableOpacity
            onPress={withdrawClaim}
            disabled={busy}
            style={[styles.cancelX, { borderColor: tokens.error }]}
            accessibilityLabel="Cancel request"
          >
            <Ionicons name="close" size={20} color={tokens.error} />
          </TouchableOpacity>
        </View>
      );
    }

    if (post.status !== POST_STATUS.ACTIVE || expired) {
      return <InformationCard text={`This ${isOffer ? "offer" : "request"} is no longer available.`} />;
    }

    return (
      <LargeButton color="green" onPress={requestClaim} disabled={busy}>
        {busy ? "Sending request..." : isOffer ? "Request to claim offer" : "Request to fulfill"}
      </LargeButton>
    );
  };

  const renderReadyFooter = (chatLabel) => (
    <>
      <LargeButton
        color="green"
        onPress={openChat}
        disabled={busy}
        leadingIcon={<Ionicons name="chatbubble-outline" size={16} color={tokens.onPrimary} />}
      >
        {chatLabel}
      </LargeButton>
      <LargeButton outlined color="green" onPress={markComplete} disabled={busy}>
        Mark as complete
      </LargeButton>
      <LargeButton outlined color={tokens.error} onPress={() => setDialog("cancelExchange")} disabled={busy}>
        Cancel exchange
      </LargeButton>
    </>
  );

  const renderOwnerFooter = () => {
    if (isReady) return renderReadyFooter(`Chat with ${firstName(otherPartyName) || "them"}`);
    if (post.status === POST_STATUS.COMPLETED) return <InformationCard text="This exchange is complete." />;
    return null;
  };

  const footer = isOwner ? renderOwnerFooter() : renderClaimantFooter();

  return (
    <Layout style={styles.screen}>
      <SmallAppBar
        title={isOffer ? "Offer" : "Request"}
        onBack={() => navigation.goBack()}
        actions={
          isOwner && post.status === POST_STATUS.ACTIVE
            ? [{ icon: "create-outline", onPress: () => navigation.navigate("DollarsEditPost", { postId }) }]
            : []
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <DollarsPostChip variant={viewerChipVariant(post, user.uid)} />
          <View style={styles.posterRow}>
            <ProfilePic uri={post.ownerPhotoUrl} size={32} bordered={false} />
            <Header4Text color={tokens.onBackground} numberOfLines={1} style={styles.posterName}>
              {post.ownerDisplayName}
            </Header4Text>
            <Header4Text color={tokens.textMedium}>{formatRelativeTime(post.createdAt)}</Header4Text>
          </View>
          <Header2Text color={tokens.onBackground}>{dollarsPostHeadline(post)}</Header2Text>
          <View style={styles.row}>
            <Ionicons name="calendar-outline" size={16} color={tokens.textMedium} />
            <SubBodyText color={tokens.textMedium}>
              Available until {formatAvailableUntil(post)}
              {!expired ? ` · ${daysLeftLabel(post)}` : " · Expired"}
            </SubBodyText>
          </View>
        </View>

        <Section title="Preferred locations" tokens={tokens}>
          {shownLocations.map((location) => (
            <View key={location.id} style={[styles.listRow, { backgroundColor: tokens.containerMedium }]}>
              <Ionicons name="location-outline" size={16} color={tokens.onContainerMedium} />
              <BodyText color={tokens.onContainerMedium} style={styles.listRowText}>{location.label}</BodyText>
            </View>
          ))}
          {locations.length > LOCATIONS_SHOWN && (
            <TouchableOpacity onPress={() => setShowAllLocations((v) => !v)}>
              <Header4Text color={tokens.primary}>
                {showAllLocations ? "View less" : `View more (${locations.length - LOCATIONS_SHOWN})`}
              </Header4Text>
            </TouchableOpacity>
          )}
        </Section>

        <Section title="Accepted payment methods" tokens={tokens}>
          {payments.map((method) => (
            <View key={method.id} style={[styles.listRow, { backgroundColor: tokens.containerMedium }]}>
              <DollarsPaymentBadges methods={[method.id]} size={20} />
              <BodyText color={tokens.onContainerMedium} style={styles.listRowText}>{method.label}</BodyText>
            </View>
          ))}
        </Section>

        {isOwner && post.status === POST_STATUS.ACTIVE && (
          <Section title={isOffer ? "Requests to claim" : "Offers to fulfill"} tokens={tokens}>
            {pendingClaims.length === 0 ? (
              <SubBodyText color={tokens.textLight}>No one has asked yet.</SubBodyText>
            ) : (
              pendingClaims.map((claim) => (
                <View key={claim.id} style={[styles.listRow, { backgroundColor: tokens.containerMedium }]}>
                  <ProfilePic uri={claim.claimantPhotoUrl} size={26} bordered={false} />
                  <BodyText color={tokens.onContainerMedium} style={styles.listRowText} numberOfLines={1}>
                    {claim.claimantDisplayName}
                  </BodyText>
                  <OutlinePillButton
                    label="Accept"
                    color={tokens.primary}
                    disabled={busy}
                    onPress={() => acceptClaim(claim.claimantID)}
                  />
                </View>
              ))
            )}
          </Section>
        )}
      </ScrollView>

      {footer && (
        <View style={[styles.footer, { backgroundColor: tokens.background, paddingBottom: Math.max(insets.bottom, 20) }]}>
          {footer}
        </View>
      )}

      <DialogOverlay visible={dialog === "cancelExchange"} onDismiss={() => setDialog(null)}>
        <Dialog
          type="Destructive"
          title="Cancel exchange?"
          primaryButtonText="Cancel exchange"
          secondaryButtonText="Back"
          onPrimaryPress={cancelExchange}
          onSecondaryPress={() => setDialog(null)}
        >
          <SubBodyText color={tokens.onBackground} center>
            {isOwner
              ? "Your post will reopen so someone else can claim it."
              : `${firstName(post.ownerDisplayName)}'s post will reopen for others.`}
          </SubBodyText>
        </Dialog>
      </DialogOverlay>

      <DialogOverlay visible={dialog === "completed"} onDismiss={() => setDialog(null)}>
        <Dialog
          type="Informative"
          title="Exchange complete!"
          icon={<Ionicons name="checkmark-circle-outline" size={40} color={tokens.primary} />}
          primaryButtonText="Close"
          onPrimaryPress={() => {
            setDialog(null);
            navigation.goBack();
          }}
        >
          <SubBodyText color={tokens.onBackground} center>
            Thanks for using the Dining Dollar Exchange.
          </SubBodyText>
        </Dialog>
      </DialogOverlay>
    </Layout>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 25,
  },
  header: {
    gap: 10,
  },
  posterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  posterName: {
    flexShrink: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  section: {
    gap: 10,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 42,
    borderRadius: radiusTokens.small,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  listRowText: {
    flex: 1,
  },
  pendingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  pendingButton: {
    flex: 1,
    width: undefined,
  },
  cancelX: {
    width: 41,
    height: 41,
    borderRadius: radiusTokens.small,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    flexDirection: "column",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopLeftRadius: radiusTokens.medium,
    borderTopRightRadius: radiusTokens.medium,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 10,
  },
});
