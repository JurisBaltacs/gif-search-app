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

const App = () => {
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [query, setQuery] = useState("");
  const [isLoadingMoreData, setIsLoadingMoreData] = useState(false);
  const [itemLimit, setItemLimit] = useState(10);

  const WINDOW_PADDING = 10;
  const windowWidth = useWindowDimensions().width;
  const gifSize = (windowWidth - WINDOW_PADDING * 2) / 3;

  // const windowWidth = useWindowDimensions().width;
  // console.log(windowWidth);

  useEffect(() => {
    handleSearch();
  }, []);

  const handleChange = (input) => {
    setQuery(input);
    handleSearch(input);
  };

  // #TODO: ielikt KEY in .env file
  const handleSearch = useCallback(
    debounce((value = "") => {
      fetch(
        `http://api.giphy.com/v1/gifs/search?q=${value}&api_key=p7D0xFESzcNBPN6fTM595XvT2PUiJ8YV&limit=${itemLimit}`,
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
          console.log("json?.data", json?.data);
          console.log("data: ", data);
          setData([...data, ...json?.data]);
        })
        .catch((error) => console.error(error))
        .finally(() => setLoading(false));
    }, 300),
    []
  );

  const handleLoadMore = () => {
    setIsLoadingMoreData(true);

    // setPage(() => page + 1);
    // () => fetchMarketData;
  };

  // console.log(data);
  console.log("itemLimit", itemLimit);
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
            style={styles.searchBar}

            // #TODO: ieviest onSend. Tagad nekas nenotiek.
          />

          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            numColumns={3}
            onEndReachedThreshold={0.01}
            // onEndReached={() => handleLoadMore()}
            onEndReached={() => setItemLimit(itemLimit + 10)}
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
