import * as React from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import {
	Ubuntu_300Light,
	Ubuntu_300Light_Italic,
	Ubuntu_400Regular,
	Ubuntu_400Regular_Italic,
	Ubuntu_500Medium,
	Ubuntu_500Medium_Italic,
	Ubuntu_700Bold,
	Ubuntu_700Bold_Italic,
} from '@expo-google-fonts/ubuntu';

import { Asset } from 'expo-asset';

export default function useCachedResources(
	images?: Array<any> | null,
	fonts?: any
) {
	const [isLoadingComplete, setLoadingComplete] = React.useState(false);

	// Load any resources or data that we need prior to rendering the app
	React.useEffect(() => {
		async function loadResourcesAndDataAsync() {
			try {
				// Load fonts
				await Promise.all([
					images && Asset.loadAsync(images),
					Font.loadAsync({
						...Ionicons.font,
						Ubuntu_300Light,
						Ubuntu_300Light_Italic,
						Ubuntu_400Regular,
						Ubuntu_400Regular_Italic,
						Ubuntu_500Medium,
						Ubuntu_500Medium_Italic,
						Ubuntu_700Bold,
						Ubuntu_700Bold_Italic,
						...fonts,
					}),
				]);
			} catch (e) {
				// We might want to provide this error information to an error reporting service
				console.warn(e);
			} finally {
				setLoadingComplete(true);
			}
		}

		loadResourcesAndDataAsync();
	}, []);

	return isLoadingComplete;
}
