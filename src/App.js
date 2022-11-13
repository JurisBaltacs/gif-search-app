import React, { useEffect, useState, useCallback } from "react";
import {
  FlatList,
  Text,
  View,
  Image,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { Searchbar } from "react-native-paper";
import debounce from "lodash/debounce";
import PRIVATE_KEY from "./Constants";

const App = () => {
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [query, setQuery] = useState("");
  // const [isLoadingMoreData, setIsLoadingMoreData] = useState(false);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    setData([]);
  }, [query]);

  const WINDOW_PADDING = 10;
  const windowWidth = useWindowDimensions().width;
  const gifSize = (windowWidth - WINDOW_PADDING * 2) / 3;
  const itemLimit = 20;

  const handleChange = (input) => {
    // if (!input) {
    //   return;
    // } else {
    setQuery(input);
    // handleSearch(input);
    // console.log("input", input);
    // console.log("query", query);
    // }
  };

  // #TODO: Nepushot constants failu
  const handleSearch = debounce((input = "space") => {
    console.log("input of handleSearch: ", input);

    fetch(
      `http://api.giphy.com/v1/gifs/search?q=${input}&api_key=${PRIVATE_KEY}&limit=${itemLimit}&offset=${offset}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => response.json())
      // .then((json) => setData(json))
      .then((json) => {
        if (json?.data.length > 0) setOffset(offset + 20);
        setData([...data, ...json?.data]);
        // console.log("json =>", json);
        // setData([...json?.data]);
      })

      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, 500);

  useEffect(() => {
    handleSearch(query, [query]);
    console.log("run useEffect");
  }, [query]);

  // console.log("data end=>", data);
  return (
    <View style={{ flex: 1, paddingHorizontal: WINDOW_PADDING }}>
      {isLoading ? (
        <Text>Loading...</Text>
      ) : (
        // #TODO: pielikt stilu
        <View style={styles.topContainer}>
          <Text style={styles.title}>Chili GIFs:</Text>
          <Searchbar
            placeholder="Type your search here"
            onChangeText={handleChange}
            value={query}
            // value={input}
            style={styles.searchBar}

            // #TODO: ieviest onSend. Tagad nekas nenotiek.
          />

          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            numColumns={3}
            onEndReachedThreshold={0.3}
            // onEndReached={() => setItemLimit(itemLimit + 20)}
            onEndReached={() => handleSearch(query)}
            renderItem={({ item }) => (
              <Image
                source={{
                  uri: item.images.preview_gif.url,
                }}
                style={{ width: gifSize, height: gifSize, margin: 2 }}
                // #TODO: pielikt border top
              />
            )}
          />
          {/* <View>
            {isLoadingMoreData ? <Text>Loading more GIFs...</Text> : null}
          </View> */}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  topContainer: {
    flex: 1,
    flexDirection: "column",
  },
  title: {
    fontSize: 14,
    color: "green",
    textAlign: "center",
    paddingTop: 30,
    paddingBottom: 10,
  },
  searchBar: {
    height: 40,
    marginBottom: 10,
  },
});

export default App;
