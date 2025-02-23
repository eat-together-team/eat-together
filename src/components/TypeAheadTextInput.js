import { useState, useMemo } from "react";
import debounce from 'lodash.debounce';
import {StyleSheet} from "react-native";
import TextInput from "./TextInput";
import LoadingView from "./LoadingView"
import { TouchableOpacity } from "react-native";
import NormalText from "./NormalText";
const DEFAULT_MAX_SEARCH_RESULTS_SIZE = 5;
const DEFAULT_MIN_SEARCH_TERM_LENGTH = 3;
const DEFAULT_DEBOUNCE_MS = 1000;


function TypeAheadTextInput(props) {
   
    const {
        value,
        searchFn,
        onChangeText,
        onSelect,
        minSearchTermLength,
        maxSearchResultsSize,
        debounceMs,
        marginBottom,
        ...restOfProps
    } = props;
    
    const [state, setState] = useState({ text: value, suggestions: [], processing: false });
    const [selectedItem, setSelectedItem] = useState(null);

    const wrappedSearchFn = useMemo(
        () => debounce(
          (term) => {
            setState(prevState => ({ ...prevState, suggestions: [], processing: true}));
            searchFn?.(term, { maxSearchResultsSize: maxSearchResultsSize || DEFAULT_MAX_SEARCH_RESULTS_SIZE})
              .then(suggestions => setState(prevState => ({ ...prevState, suggestions: [{id: "user", name: term}, ...suggestions], processing: false })) );
          },
          debounceMs || DEFAULT_DEBOUNCE_MS
        ),
        [searchFn, maxSearchResultsSize, debounceMs]
      );

    return (
        <>
            <TextInput
                {...restOfProps}
                value={state.text}
                marginBottom={10}
                onChangeText={val => {
                    setState(prevState => ({...prevState, text: val, suggestions: [] }));
                    const trimmed = val?.trim();
                    if (trimmed && trimmed.length >= (minSearchTermLength || DEFAULT_MIN_SEARCH_TERM_LENGTH))
                      wrappedSearchFn(trimmed);
                    onChangeText?.(val);
                }}           
            />
            {state.processing && <LoadingView/>}
            { state.suggestions.map((suggestion, index) => {
                const isSelected = selectedItem === suggestion.name;
                return(
                    <TouchableOpacity
                    key={suggestion.name}
                    style={[
                      styles.item,
                      { backgroundColor: isSelected ? '#5db075' : 'white'}, // Change background color when pressed
                    ]}
                    marginBottom={index === state.suggestions.length - 1 ? marginBottom : 5}
                    onPress={() => {
                      setState((prevState) => ({ ...prevState, text: suggestion.name, suggestions: [] }));
                      onChangeText?.(suggestion.name);
                      onSelect?.(suggestion.name);
                    }}
                    onPressIn={() => setSelectedItem(suggestion.name)} // Track selected item
                    onPressOut={() => setSelectedItem(null)} // Reset on release
                    activeOpacity={1}
                  >
                    <NormalText 
                    color={isSelected ? 'white' : 'black'}
                    numberofLines = {1}
                    ellipsizeMode="tail"
                    > 
                      {suggestion.name}
                    </NormalText>
                  </TouchableOpacity>
        
                );
            })}
        </>
    );
  }


  const styles = StyleSheet.create({
    item: {
        flex: 1,
        flexDirection: 'row',
        padding: 10,
        borderRadius: 5,
        marginTop: 2
    },

  });

  export default TypeAheadTextInput;