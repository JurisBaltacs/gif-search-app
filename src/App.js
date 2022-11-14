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
  const [page, setPage] = useState(1);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    setData([]);
    // resetOffset();
  }, [query]);

  const WINDOW_PADDING = 10;
  const windowWidth = useWindowDimensions().width;
  const gifSize = (windowWidth - WINDOW_PADDING * 2) / 3;
  const itemLimit = 20;

  const handleChange = (input) => {
    setQuery(input);
  };

  const loadData = (input, page, offset) => {
    setPage(page + 1);
    setOffset(itemLimit * page);
    console.log("offset in loadData =>", offset);
    console.log("page in loadData =>", page);
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
      .then((json) => {
        // if (json?.data.length > 0) setOffset(offset + itemLimit);
        if (json?.data.length > 0) setData([...data, ...json?.data]); // Vai šis if jau nenohandlo situāciju, kur data array nav jāpapildina?
      })
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
    console.log("Run loadData");
  };

  // #TODO: Nepushot Constants failu
  const handleSearch = useCallback(
    debounce((input = "") => {
      loadData(input, 1);
      console.log("Run debounce");
    }, 300),
    [offset]
  );
  // [offset] // Ar šito data in debounce === [], jaunie GIFI nepieliekas klāt.
  // [query] // Ar šito izskatās, ka API call uz katra burta un nav pagination kad nobraucu līdz ekrāna apakšai.
  // [input] // error, ka input not defined.

  useEffect(() => {
    handleSearch(query, [query]);
  }, [query]);

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
            onEndReachedThreshold={0.5}
            onEndReached={() => {
              // handleSearch(query);
              loadData(query, page, offset);
            }}
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
