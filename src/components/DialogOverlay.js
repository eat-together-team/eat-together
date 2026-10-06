import React from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import Scrim from './Scrim';

const DialogOverlay = ({ visible, onDismiss, children }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.container}>
        <Scrim onPress={onDismiss} />
        <View style={styles.dialogContainer}>
          {children}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  dialogContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
});

export default DialogOverlay;
