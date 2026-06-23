import React, { useRef, useCallback } from 'react';
import {
    View,
    StyleSheet,
    StatusBar,
    Dimensions,
} from 'react-native';
import Video, { OnLoadData } from 'react-native-video';
import { useApp } from '../AppContext';

const { width, height } = Dimensions.get('window');

interface WelcomeScreenProps {
    onComplete: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
    const { colorScheme } = useApp();
    const isDark = colorScheme === 'dark';
    const videoRef = useRef<any>(null);

    const handleEnd = useCallback(() => {
        onComplete();
    }, [onComplete]);

    const videoSource = isDark
        ? require('../../assets/videos/video-dark.mp4')
        : require('../../assets/videos/video-light.mp4');

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
                backgroundColor="transparent"
                translucent
            />
            <Video
                ref={videoRef}
                source={videoSource}
                style={styles.video}
                resizeMode="cover"
                repeat={false}
                playInBackground={false}
                playWhenInactive={false}
                ignoreSilentSwitch="obey"
                onEnd={handleEnd}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        width,
        height,
    },
    video: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        width: '100%',
        height: '100%',
    },
});
