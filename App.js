import React, { useEffect, useState } from "react";
import {
  FlatList,
  Text,
  View,
  Image,
  TextInput,
  StyleSheet,
} from "react-native";
import { Searchbar } from "react-native-paper";
import debounce from "lodash/debounce";

const App = () => {
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("chili");

  const onChangeSearch = (query) => setSearchQuery(query);

  useEffect(() => {
    fetch(
      `http://api.giphy.com/v1/gifs/search?q=${searchQuery}&api_key=p7D0xFESzcNBPN6fTM595XvT2PUiJ8YV&limit=30`
    ) // #TODO: ielikt KEY in .env file
      .then((response) => response.json())
      .then((json) => setData(json))
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, [searchQuery]);

  return (
    <View style={{ flex: 1, padding: 24 }}>
      {isLoading ? (
        <Text>Loading...</Text>
      ) : (
        <View style={styles.topContainer}>
          <Text style={styles.title}>GIFs:</Text>
          <Searchbar
            placeholder="Search"
            onChangeText={onChangeSearch}
            value={searchQuery}
          />

          <FlatList
            data={data.data}
            keyExtractor={({ id }, index) => id}
            renderItem={({ item }) => (
              <Image
                source={{
                  uri: item.images.original.url,
                }}
                style={styles.gifContainer}
              />
            )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  topContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 14,
    color: "green",
    textAlign: "center",
    paddingBottom: 10,
  },
  searchBar: {
    height: 50,
    borderWidth: 1,
    borderColor: "green",
  },
  gifContainer: {
    width: 100,
    height: 100,
  },
});

export default App;
