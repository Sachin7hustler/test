import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import XLSX from 'xlsx';

const GridInput = () => {
  const [gridData, setGridData] = useState([]);

  useEffect(() => {
    retrieveGridData();
  }, []);

  useEffect(() => {
    saveGridData();
  }, [gridData]);

  const retrieveGridData = async () => {
    try {
      const savedGridData = await AsyncStorage.getItem('gridData');

      if (savedGridData !== null) {
        setGridData(JSON.parse(savedGridData));
      }
    } catch (error) {
      console.log('Error retrieving grid data:', error);
    }
  };

  const saveGridData = async () => {
    try {
      await AsyncStorage.setItem('gridData', JSON.stringify(gridData));
    } catch (error) {
      console.log('Error saving grid data:', error);
    }
  };

  const handleInputChange = (rowIndex, colIndex, value) => {
    const updatedGridData = [...gridData];
    const index = updatedGridData.findIndex(
      (item) => item.rowIndex === rowIndex && item.colIndex === colIndex
    );

    if (index !== -1) {
      updatedGridData[index] = { rowIndex, colIndex, value };
    } else {
      updatedGridData.push({ rowIndex, colIndex, value });
    }

    setGridData(updatedGridData);
  };

  const handleDownload = () => {
    const workbook = XLSX.utils.book_new();
    const worksheetData = gridData.map((row) => row.map((cell) => cell.value));
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet 1');

    const wbout = XLSX.write(workbook, {
      type: 'base64',
      bookType: 'xlsx',
    });

    const uri = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${wbout}`;
    saveAs(uri, 'data.xlsx');
  };

  const saveAs = (uri, filename) => {
    const link = document.createElement('a');
    link.href = uri;
    link.download = filename;
    link.click();
  };

  const renderGrid = () => {
    const rows = [];

    for (let row = 0; row < 10; row++) {
      const cols = [];

      for (let col = 0; col < 5; col++) {
        const index = gridData.findIndex(
          (item) => item.rowIndex === row && item.colIndex === col
        );

        const value = index !== -1 ? gridData[index].value : '';

        cols.push(
          <TextInput
            key={`${row}-${col}`}
            style={styles.input}
            onChangeText={(value) => handleInputChange(row, col, value)}
            value={value}
          />
        );
      }

      rows.push(
        <View key={row} style={styles.row}>
          {cols}
        </View>
      );
    }

    return rows;
  };

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <Text style={styles.logo}>My App</Text>
        <TouchableOpacity onPress={handleDownload} style={styles.button}>
          <Text style={styles.buttonText}>Download</Text>
        </TouchableOpacity>
      </View>
      {renderGrid()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
    paddingHorizontal: 10,
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#333',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logo: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  buttonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'gray',
    paddingHorizontal: 10,
    height: 40,
    marginRight: 10,
  },
});

export default GridInput;
