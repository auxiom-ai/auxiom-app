import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button } from 'react-native';
import { DAYS_OF_WEEK } from '../../constants/daysOfWeek';
import { useActions } from '../../contexts/ActionsContext';

const Day: React.FC = () => {
  const router = useRouter();
  const actions = useActions();
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);

  const handleSubmit = async (): Promise<void> => {
    try {
      await actions.updateUserDays([DAYS_OF_WEEK[selectedDayIndex]])
      router.replace("/onboarding/interests" as any)
    } catch (error) {
      console.error(error)
      Alert.alert("Error saving days", error instanceof Error ? error.message : "An unknown error occurred")
    }
  }

  return (
    <Button title="Submit" onPress={handleSubmit} />
  );
};

export default Day; 