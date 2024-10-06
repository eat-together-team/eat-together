import { useState, useMemo } from "react";
import debounce from 'lodash.debounce';
import TextInput from "./TextInput";
import Filter from "./Filter";

const DEFAULT_MAX_SEARCH_RESULTS_SIZE = 5;
const DEFAULT_MIN_SEARCH_TERM_LENGTH = 3;
const DEFAULT_DEBOUNCE_MS = 1000;


function TypeAheadTextInput(props) {
   
    const {
        searchFn,
        onChangeText,
        onSelect,
        minSearchTermLength,
        maxSearchResultsSize,
        debounceMs,
        marginBottom,
        ...restOfProps
    } = props;
    
    const [state, setState] = useState({ text: props.value, suggestions: [] });

    const wrappedSearchFn = useMemo(
        () => debounce(
          (term) => {
            searchFn?.(term, { maxSearchResultsSize: maxSearchResultsSize || DEFAULT_MAX_SEARCH_RESULTS_SIZE})
              .then(suggestions => setState(prevState => ({ ...prevState, suggestions })) );
          },
          debounceMs || DEFAULT_DEBOUNCE_MS
        ),
        [searchFn, maxSearchResultsSize, debounceMs]
      );

    return (
        <>
            <TextInput
                {...restOfProps}
                marginBottom={10}
                onChangeText={val => {
                    setState(prevState => ({...prevState, text: val, suggestions: [] }));
                    const trimmed = val?.trim();
                    if (trimmed && trimmed.length >= (minSearchTermLength || DEFAULT_MIN_SEARCH_TERM_LENGTH))
                      wrappedSearchFn(trimmed);
                    onChangeText?.(val);
                }}           
            />
            { state.suggestions.map((suggestion, index) => <Filter
              key={suggestion.id}
              checked={props.value === suggestion.name}
              text={suggestion.name}
              marginBottom={index === state.suggestions.lenght - 1 ? marginBottom : 5}
              onPress={() => {
                setState(prevState => ({...prevState, text: suggestion.name, suggestions: [] }));
                onChangeText?.(suggestion.name);
                onSelect?.();
              }}
            />) }
        </>
    );
  }

  export default TypeAheadTextInput;