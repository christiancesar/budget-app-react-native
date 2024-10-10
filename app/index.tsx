import { useEffect, useState } from "react";
import {
  Button,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";
import {
  SpaceGrotesk_700Bold,
  useFonts,
} from "@expo-google-fonts/space-grotesk";
import {
  CloudX,
  CurrencyCircleDollar,
  Database,
  TrashSimple,
} from "@phosphor-icons/react";
import { Poppins_400Regular } from "@expo-google-fonts/poppins";
import { SelectList } from "react-native-dropdown-select-list";

type Budget = {
  id: string;
  short_id: string;
  customer_name: string;
  delivery_at: string;
  status: string;
};

const StatusData = [
  { key: "pendente", value: "pendente" },
  { key: "entregue", value: "entregue" },
  { key: "cancelado", value: "cancelado" },
];

export default function Index() {
  const [budgets, setBudgets] = useState([] as Budget[]);
  const [apiStatus, setApiStatus] = useState(false);

  const [newCustomerName, setNewCustomerName] = useState("");
  const [shortIdBudget, setShortIdBudget] = useState("");
  const [budgetId, setBudgetId] = useState("");
  const [customerNameModify, setCustomerNameModify] = useState("");
  const [statusBudget, setStatusBudget] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/api/budgets")
      .then((response) => response.json())
      .then((json) => {
        setApiStatus(true);
        // console.log(json);
        return setBudgets(json);
      })
      .catch((error) => {
        console.log(error);
        setBudgets([]);
        setApiStatus(false);
      });
  }, []);

  const [modalVisible, setModalVisible] = useState(false);
  const [createNewBudget, setCreateNewBudget] = useState(false);

  useFonts({
    SpaceGrotesk_700Bold,
    Poppins_400Regular,
  });

  const onHandleCreateBudget = () => {
    fetch("http://localhost:8000/api/budgets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer_name: newCustomerName,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        console.log(json);
        setBudgets([...budgets, json]);
        setNewCustomerName("");
        setModalVisible(false);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const onHandleDeleteBudget = (id: string) => {
    fetch(`http://localhost:8000/api/budgets/${id}`, {
      method: "DELETE",
    }).then((response) => {
      if (response.status === 200) {
        setBudgets(() => budgets.filter((budget) => budget.id !== id));
      }
    });
  };

  const onHandleUpdateBudget = async (id: string) => {
    fetch(`http://localhost:8000/api/budgets/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer_name: customerNameModify,
        status: statusBudget,
      }),
    }).then(async (response) => {
      if (response.status === 200) {
        const budgetUpdated = (await response.json()) as Budget;
        setBudgets(() =>
          budgets.map((budget) => {
            if (budget.id === id) {
              return {
                ...budget,
                customer_name: customerNameModify,
                status: statusBudget,
                delivery_at: budgetUpdated.delivery_at,
              };
            }
            return budget;
          })
        );
        setModalVisible(false);
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text style={styles.header}>
          Budget App <CurrencyCircleDollar size={32} />
        </Text>
      </View>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        style={{
          width: "100%",
          height: "100%",
        }}
        contentContainerStyle={{
          height: "100%",
        }}
      >
        {!apiStatus ? (
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <CloudX
              style={{
                ...styles.noContent,
                marginBottom: 20,
              }}
              size={64}
            />
            <Text style={styles.noContent}> Erro ao carregar os dados </Text>
          </View>
        ) : budgets.length === 0 ? (
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <Database
              style={{
                ...styles.noContent,
                marginBottom: 20,
              }}
              size={64}
            />
            <Text style={styles.noContent}>Dados não encontrado</Text>
          </View>
        ) : (
          budgets.map((budget) => (
            <View key={budget.id} style={styles.content}>
              <Pressable
                style={{
                  flexDirection: "column",
                  alignItems: "baseline",
                  width: "80%",
                }}
                onPress={() => {
                  setModalVisible(true);
                  setCreateNewBudget(false);
                  setCustomerNameModify(budget.customer_name);
                  setShortIdBudget(budget.short_id);
                  setStatusBudget(budget.status);
                  setBudgetId(budget.id);
                }}
              >
                <Text style={{ ...styles.text, color: "#cfcfcf" }}>
                  #{budget.short_id}
                </Text>
                <Text
                  style={{
                    ...styles.text,
                    fontWeight: "bold",
                    fontSize: 16,
                    flexGrow: 1,
                    flexWrap: "wrap",
                  }}
                >
                  {budget.customer_name}
                </Text>
                <Text style={{ ...styles.text, color: "#cfcfcf" }}>
                  {budget.status == "entregue"
                    ? `${budget.status} em ${new Date(
                        budget.delivery_at
                      ).toLocaleDateString("pt-BR")}`
                    : budget.status}
                </Text>
              </Pressable>
              <Pressable onPress={() => onHandleDeleteBudget(budget.id)}>
                <TrashSimple
                  style={{
                    ...styles.text,
                    color: "#f83737",
                  }}
                  size={18}
                />
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>

      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignContent: "center",
        }}
      >
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View
            style={{
              flex: 1,
              padding: 20,
              borderRadius: 8,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#0f0f1ac7",
            }}
          >
            <View
              style={{
                alignItems: "center",
                borderRadius: 8,
                backgroundColor: "#1e1e3c",
                elevation: 5,
                width: "100%",
                height: "50%",
                padding: 20,
              }}
            >
              {createNewBudget ? (
                <View>
                  <Text style={styles.text}>Criar um novo orçamento</Text>
                  <TextInput
                    style={{
                      ...styles.text,
                      color: "#000",
                      backgroundColor: "#fff",
                      padding: 10,
                      borderRadius: 8,
                      width: "100%",
                      marginTop: 20,
                    }}
                    placeholder="Nome do cliente"
                    value={newCustomerName}
                    onChangeText={(text) => setNewCustomerName(text)}
                  />
                  <View
                    style={{
                      flexDirection: "row",
                      marginTop: 20,
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    <Pressable
                      style={{
                        backgroundColor: "#f83737",
                        padding: 10,
                        borderRadius: 8,
                        width: "45%",
                        alignItems: "center",
                      }}
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={styles.text}>Cancelar</Text>
                    </Pressable>
                    <Pressable
                      style={{
                        backgroundColor: "#0f0f1a",
                        padding: 10,
                        borderRadius: 8,
                        width: "45%",
                        alignItems: "center",
                      }}
                      onPress={() => onHandleCreateBudget()}
                    >
                      <Text style={styles.text}>Confirmar</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <View>
                  <Text style={styles.text}>Orçamento #{shortIdBudget}</Text>
                  <TextInput
                    style={{
                      ...styles.text,
                      color: "#000",
                      backgroundColor: "#fff",
                      padding: 10,
                      borderRadius: 8,
                      width: "100%",
                      marginTop: 20,
                    }}
                    placeholder="Nome do cliente"
                    value={customerNameModify}
                    onChangeText={(text) => setCustomerNameModify(text)}
                  />
                  <SelectList
                    setSelected={(key: string) => setStatusBudget(key)}
                    data={StatusData}
                    save="value"
                    boxStyles={{
                      backgroundColor: "#fff",
                      padding: 10,
                      borderRadius: 8,
                      width: "100%",
                      marginTop: 20,
                    }}
                    dropdownStyles={{
                      backgroundColor: "#fff",
                      padding: 10,
                      borderRadius: 8,
                      width: "100%",
                      marginTop: 20,
                    }}
                    fontFamily="Poppins_400Regular"
                    searchPlaceholder="Selecione um status"
                    search={false}
                    defaultOption={StatusData.find(
                      (status) => status.key === statusBudget
                    )}
                  />
                  <View
                    style={{
                      flexDirection: "row",
                      marginTop: 20,
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    <Pressable
                      style={{
                        backgroundColor: "#f83737",
                        padding: 10,
                        borderRadius: 8,
                        width: "45%",
                        alignItems: "center",
                      }}
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={styles.text}>Cancelar</Text>
                    </Pressable>
                    <Pressable
                      style={{
                        backgroundColor: "#0f0f1a",
                        padding: 10,
                        borderRadius: 8,
                        width: "45%",
                        alignItems: "center",
                      }}
                      onPress={() => onHandleUpdateBudget(budgetId)}
                    >
                      <Text style={styles.text}>Confirmar</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>
          </View>
        </Modal>
      </View>

      <View
        style={{
          marginTop: 20,
          width: "100%",
          alignItems: "center",
          borderRadius: 8,
        }}
      >
        <Pressable
          style={{
            backgroundColor: "#1e1e3c",
            padding: 10,
            borderRadius: 8,
            width: "100%",
            alignItems: "center",
          }}
          onPress={() => {
            setModalVisible(true);
            setCreateNewBudget(true);
          }}
        >
          <Text style={styles.text}>Novo Orçamento</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#0f0f1a",
  },
  header: {
    color: "#fff",
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 24,
    marginBottom: 20,
  },
  text: {
    color: "#fff",
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    margin: 10,
    height: 110,
    backgroundColor: "#1e1e3c",
    borderRadius: 8,
  },
  noContent: {
    color: "#cfcfcf",
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
  },
});
