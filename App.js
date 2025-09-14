
import React, { useMemo, useState, useEffect, createContext, useContext } from 'react';
import { View, Text, Pressable, TextInput, FlatList, ScrollView, Alert, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

/**********************
 * Global state (simple MVP store)
 **********************/
const AppContext = createContext(null);
const useApp = () => useContext(AppContext);

const AppProvider = ({ children }) => {
  // onboarding stage: intro → login → policy → profile → review → authed
  const [stage, setStage] = useState('intro');

  const [user, setUser] = useState({
    name: '',
    mbti: '',
    photos: [],
    answers: '',
  });

  const [matches, setMatches] = useState([]);
  const [approved, setApproved] = useState(false);

  const value = useMemo(() => ({ stage, setStage, user, setUser, matches, setMatches, approved, setApproved }), [stage, user, matches, approved]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

/**********************
 * Onboarding screens
 **********************/
const IntroScreen = ({ navigation }) => {
  const { setStage } = useApp();
  return (
    <View style={s.container}>
      <Text style={s.title}>주선자 소개팅 앱</Text>
      <Text style={s.subtitle}>우리 앱은 주선자가 직접 소개해주는 소개팅 서비스예요.{'\n'}3일에 한 번, 신중하게 매칭합니다.</Text>
      <Pressable style={s.primaryBtn} onPress={() => { setStage('login'); navigation.replace('Login'); }}>
        <Text style={s.primaryBtnText}>시작하기</Text>
      </Pressable>
    </View>
  );
};

const LoginScreen = ({ navigation }) => {
  const { setStage } = useApp();
  return (
    <View style={s.container}>
      <Text style={s.title}>로그인</Text>
      <View style={{ height: 16 }} />
      <Pressable style={s.kakaoBtn} onPress={() => { setStage('policy'); navigation.replace('Policy'); }}>
        <Text style={s.btnTextDark}>카카오로 계속하기 (더미)</Text>
      </Pressable>
      <View style={{ height: 10 }} />
      <Pressable style={s.googleBtn} onPress={() => { setStage('policy'); navigation.replace('Policy'); }}>
        <Text style={s.btnText}>Google로 계속하기 (더미)</Text>
      </Pressable>
    </View>
  );
};

const PolicyScreen = ({ navigation }) => {
  const { setStage } = useApp();
  return (
    <View style={s.container}>
      <Text style={s.title}>서비스 정책</Text>
      <View style={{ height: 10 }} />
      <Text style={s.paragraph}>• 소개 주기: 3일에 한 번{'\n'}• 소개팅 비용: 29,000원 (예시){'\n'}• 이용 약관 및 개인정보 처리방침에 동의해 주세요.</Text>
      <View style={{ height: 24 }} />
      <Pressable style={s.primaryBtn} onPress={() => { setStage('profile'); navigation.replace('ProfileReg'); }}>
        <Text style={s.primaryBtnText}>동의하고 계속</Text>
      </Pressable>
    </View>
  );
};

const ProfileRegistrationScreen = ({ navigation }) => {
  const { user, setUser, setStage } = useApp();
  const [name, setName] = useState(user.name);
  const [mbti, setMbti] = useState(user.mbti);
  const [answers, setAnswers] = useState(user.answers);
  const canNext = name?.trim().length > 0 && mbti?.trim().length > 0;

  return (
    <ScrollView contentContainerStyle={s.container}>
      <Text style={s.title}>프로필 등록</Text>

      <Text style={s.label}>이름</Text>
      <TextInput style={s.input} placeholder="홍길동" value={name} onChangeText={setName} />

      <Text style={s.label}>MBTI</Text>
      <TextInput style={s.input} placeholder="예: ENFP" value={mbti} onChangeText={setMbti} autoCapitalize="characters" />

      <Text style={s.label}>문답 (자기소개/이상형 등)</Text>
      <TextInput style={[s.input, { height: 120, textAlignVertical: 'top' }]} multiline placeholder="간단한 자기소개와 이상형을 적어주세요." value={answers} onChangeText={setAnswers} />

      <View style={{ height: 8 }} />
      <Text style={s.note}>사진 업로드는 추후 구현 (현재는 기본 아바타 사용)</Text>

      <View style={{ height: 24 }} />
      <Pressable
        style={[s.primaryBtn, !canNext && { opacity: 0.5 }]}
        onPress={() => {
          if (!canNext) return;
          setUser(prev => ({ ...prev, name, mbti, answers }));
          setStage('review');
          navigation.replace('UnderReview');
        }}
      >
        <Text style={s.primaryBtnText}>제출하기</Text>
      </Pressable>
    </ScrollView>
  );
};

const UnderReviewScreen = ({ navigation }) => {
  const { setApproved, setStage } = useApp();
  return (
    <View style={s.container}>
      <Text style={s.title}>심사 중이에요</Text>
      <Text style={s.paragraph}>제출하신 프로필을 검토 중입니다. 승인되면 서비스 이용이 가능해요.</Text>
      <View style={{ height: 24 }} />
      <Pressable
        style={s.primaryBtn}
        onPress={() => {
          setApproved(true);
          setStage('authed');
          navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
        }}
      >
        <Text style={s.primaryBtnText}>[더미] 심사 통과시키기</Text>
      </Pressable>
    </View>
  );
};

/**********************
 * Tabs
 **********************/
const MatchmakerChatScreen = () => {
  const [messages, setMessages] = useState([
    { id: '1', from: 'matchmaker', text: '안녕하세요! 담당 주선자입니다. 취향 파악을 위해 몇 가지 여쭤볼게요.' },
  ]);
  const [input, setInput] = useState('');

  const send = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { id: String(Date.now()), from: 'me', text: input.trim() }]);
    setInput('');
  };

  return (
    <View style={s.flex1}>
      <FlatList
        style={{ flex: 1, padding: 16 }}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[s.bubble, item.from === 'me' ? s.bubbleMe : s.bubbleThem]}>
            <Text style={item.from === 'me' ? s.bubbleTextMe : s.bubbleTextThem}>{item.text}</Text>
          </View>
        )}
      />
      <View style={s.inputRow}>
        <TextInput style={[s.input, { flex: 1, marginRight: 8 }]} value={input} onChangeText={setInput} placeholder="메시지 보내기" />
        <Pressable style={s.primaryBtnSmall} onPress={send}><Text style={s.primaryBtnText}>전송</Text></Pressable>
      </View>
    </View>
  );
};

const MatchStatusListScreen = ({ navigation }) => {
  const { matches, setMatches } = useApp();

  const createDummyMatch = () => {
    const id = `m${Date.now()}`;
    setMatches(prev => [
      ...prev,
      { id, partnerName: 'Alex', status: 'matched', messages: [ { from: 'them', text: '안녕하세요! 반가워요 :)' } ] }
    ]);
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>소개팅 현황</Text>
      <FlatList
        style={{ width: '100%', marginTop: 12 }}
        data={matches}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={s.note}>아직 매칭이 없습니다. (더미) 매칭 생성으로 테스트해보세요.</Text>}
        renderItem={({ item }) => (
          <Pressable style={s.card} onPress={() => navigation.navigate('MatchChat', { id: item.id })}>
            <Text style={s.cardTitle}>{item.partnerName}</Text>
            <Text style={s.cardDesc}>상태: {item.status === 'matched' ? '매칭 완료' : item.status}</Text>
          </Pressable>
        )}
      />
      <View style={{ height: 12 }} />
      <Pressable style={s.secondaryBtn} onPress={createDummyMatch}>
        <Text style={s.btnTextDark}>[더미] 매칭 생성</Text>
      </Pressable>
    </View>
  );
};

const MatchChatScreen = ({ route }) => {
  const { id } = route.params || {};
  const { matches, setMatches } = useApp();
  const match = matches.find(m => m.id === id);
  const [input, setInput] = useState('');

  const send = () => {
    if (!input.trim()) return;
    setMatches(prev => prev.map(m => m.id === id ? {
      ...m,
      messages: [...(m.messages || []), { from: 'me', text: input.trim() }]
    } : m));
    setInput('');
  };

  if (!match) return (
    <View style={s.container}><Text>존재하지 않는 매칭입니다.</Text></View>
  );

  return (
    <View style={s.flex1}>
      <FlatList
        style={{ flex: 1, padding: 16 }}
        data={match.messages || []}
        keyExtractor={(_, idx) => String(idx)}
        renderItem={({ item }) => (
          <View style={[s.bubble, item.from === 'me' ? s.bubbleMe : s.bubbleThem]}>
            <Text style={item.from === 'me' ? s.bubbleTextMe : s.bubbleTextThem}>{item.text}</Text>
          </View>
        )}
      />
      <View style={s.inputRow}>
        <TextInput style={[s.input, { flex: 1, marginRight: 8 }]} value={input} onChangeText={setInput} placeholder="메시지 보내기" />
        <Pressable style={s.primaryBtnSmall} onPress={send}><Text style={s.primaryBtnText}>전송</Text></Pressable>
      </View>
    </View>
  );
};

const DiscoverScreen = () => {
  const { setMatches } = useApp();
  const candidates = [
    { id: 'c1', name: 'Jamie', mbti: 'INTJ', blurb: '책, 커피, 전시 좋아요' },
    { id: 'c2', name: 'Robin', mbti: 'ENFP', blurb: '등산/러닝/강아지' },
    { id: 'c3', name: 'Taylor', mbti: 'ISTP', blurb: '보드게임/캠핑' },
  ];

  const requestIntro = (c) => {
    Alert.alert('소개 요청 완료', `${c.name} 소개를 주선자에게 요청했어요.`);
  };

  const instantMatchForDemo = (c) => {
    const id = `m${Date.now()}`;
    setMatches(prev => [...prev, { id, partnerName: c.name, status: 'matched', messages: [{ from: 'them', text: '반가워요! ☺️' }] }]);
    Alert.alert('매칭 생성', `${c.name}와(과) 매칭되었어요. 소개팅 현황에서 대화를 시작하세요.`);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={s.title}>이상형 추천</Text>
      {candidates.map(c => (
        <View key={c.id} style={s.card}>
          <Text style={s.cardTitle}>{c.name} · {c.mbti}</Text>
          <Text style={s.cardDesc}>{c.blurb}</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            <Pressable style={s.secondaryBtn} onPress={() => requestIntro(c)}>
              <Text style={s.btnTextDark}>주선자에게 소개 요청</Text>
            </Pressable>
            <Pressable style={s.primaryBtn} onPress={() => instantMatchForDemo(c)}>
              <Text style={s.primaryBtnText}>[더미] 바로 매칭</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const MyProfileScreen = () => {
  const { user, setUser } = useApp();
  const [name, setName] = useState(user.name || '');
  const [mbti, setMbti] = useState(user.mbti || '');
  const [answers, setAnswers] = useState(user.answers || '');

  const save = () => {
    setUser(prev => ({ ...prev, name, mbti, answers }));
    Alert.alert('저장됨', '내 정보가 업데이트되었습니다.');
  };

  return (
    <ScrollView contentContainerStyle={s.container}>
      <Text style={s.title}>내 정보</Text>
      <Text style={s.label}>이름</Text>
      <TextInput style={s.input} value={name} onChangeText={setName} placeholder="홍길동" />
      <Text style={s.label}>MBTI</Text>
      <TextInput style={s.input} value={mbti} onChangeText={setMbti} placeholder="ENFP" autoCapitalize="characters" />
      <Text style={s.label}>문답</Text>
      <TextInput style={[s.input, { height: 120, textAlignVertical: 'top' }]} value={answers} onChangeText={setAnswers} multiline />
      <View style={{ height: 12 }} />
      <Pressable style={s.primaryBtn} onPress={save}><Text style={s.primaryBtnText}>저장</Text></Pressable>
    </ScrollView>
  );
};

/**********************
 * Navigation
 **********************/
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MatchStatusStackNav = createNativeStackNavigator();
const MatchStatusStack = () => (
  <MatchStatusStackNav.Navigator>
    <MatchStatusStackNav.Screen name="MatchList" component={MatchStatusListScreen} options={{ title: '소개팅 현황' }} />
    <MatchStatusStackNav.Screen name="MatchChat" component={MatchChatScreen} options={{ title: '대화' }} />
  </MatchStatusStackNav.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: true,
      tabBarIcon: ({ focused, color, size }) => {
        let icon = 'ellipse';
        if (route.name === '주선자') icon = focused ? 'chatbubble' : 'chatbubble-outline';
        if (route.name === '현황') icon = focused ? 'heart' : 'heart-outline';
        if (route.name === '이상형') icon = focused ? 'people' : 'people-outline';
        if (route.name === '내정보') icon = focused ? 'person' : 'person-outline';
        return <Ionicons name={icon} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#111',
      tabBarInactiveTintColor: '#777',
    })}
  >
    <Tab.Screen name="주선자" component={MatchmakerChatScreen} options={{ title: '담당 주선자' }} />
    <Tab.Screen name="현황" component={MatchStatusStack} options={{ headerShown: false, title: '소개팅 현황' }} />
    <Tab.Screen name="이상형" component={DiscoverScreen} options={{ title: '이상형 추천' }} />
    <Tab.Screen name="내정보" component={MyProfileScreen} options={{ title: '내 정보' }} />
  </Tab.Navigator>
);

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: '#fff' }
};

function RootNavigator() {
  const { stage } = useApp();

  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      {stage === 'intro' && (
        <Stack.Screen name="Intro" component={IntroScreen} options={{ headerShown: false }} />
      )}
      {stage === 'login' && (
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: '로그인' }} />
      )}
      {stage === 'policy' && (
        <Stack.Screen name="Policy" component={PolicyScreen} options={{ title: '서비스 정책' }} />
      )}
      {stage === 'profile' && (
        <Stack.Screen name="ProfileReg" component={ProfileRegistrationScreen} options={{ title: '프로필 등록' }} />
      )}
      {stage === 'review' && (
        <Stack.Screen name="UnderReview" component={UnderReviewScreen} options={{ title: '심사 대기' }} />
      )}
      {stage === 'authed' && (
        <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
      )}
      <Stack.Screen name="IntroFallback" component={IntroScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer theme={navTheme}>
        <StatusBar style="dark" />
        <RootNavigator />
      </NavigationContainer>
    </AppProvider>
  );
}

/**********************
 * Styles
 **********************/
const s = StyleSheet.create({
  flex1: { flex: 1 },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#444', marginTop: 8, textAlign: 'center' },
  paragraph: { fontSize: 15, color: '#333', textAlign: 'center' },
  label: { alignSelf: 'flex-start', marginTop: 16, marginBottom: 6, fontWeight: '600' },
  input: { width: '100%', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, backgroundColor: '#fff' },
  note: { color: '#666', textAlign: 'center' },

  primaryBtn: { backgroundColor: '#111', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 },
  primaryBtnSmall: { backgroundColor: '#111', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  primaryBtnText: { color: '#fff', fontWeight: '700' },

  secondaryBtn: { backgroundColor: '#eee', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  btnText: { color: '#fff', fontWeight: '700' },
  btnTextDark: { color: '#111', fontWeight: '700' },
  kakaoBtn: { backgroundColor: '#FAE100', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 },
  googleBtn: { backgroundColor: '#111', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 },

  card: { width: '100%', borderWidth: 1, borderColor: '#eee', padding: 14, borderRadius: 12, marginBottom: 12, backgroundColor: '#fff' },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardDesc: { fontSize: 13, color: '#555', marginTop: 4 },

  bubble: { maxWidth: '80%', padding: 10, borderRadius: 12, marginBottom: 8 },
  bubbleMe: { alignSelf: 'flex-end', backgroundColor: '#111' },
  bubbleThem: { alignSelf: 'flex-start', backgroundColor: '#eee' },
  bubbleTextMe: { color: '#fff' },
  bubbleTextThem: { color: '#111' },

  inputRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderTopWidth: 1, borderColor: '#eee' },
});