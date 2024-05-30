import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Dimensions, Text, PanResponder } from 'react-native';

const { width, height } = Dimensions.get('window');
const BALL_SIZE = 20;
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 20;
const PADDLE_Y = height - 50;

export default function App() {
  const [ballPos, setBallPos] = useState({ x: width / 2 - BALL_SIZE / 2, y: height / 2 - BALL_SIZE / 2 });
  const [ballDir, setBallDir] = useState({ x: 4, y: 4 });
  const [paddlePos, setPaddlePos] = useState(width / 2 - PADDLE_WIDTH / 2);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const ballPosRef = useRef(ballPos);
  const ballDirRef = useRef(ballDir);
  const paddlePosRef = useRef(paddlePos);

  useEffect(() => {
    ballPosRef.current = ballPos;
    ballDirRef.current = ballDir;
    paddlePosRef.current = paddlePos;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (gameOver) return;
      setBallPos((prev) => {
        let { x, y } = prev;
        let { x: dx, y: dy } = ballDirRef.current;

        x += dx;
        y += dy;

        if (x <= 0 || x + BALL_SIZE >= width) dx = -dx;
        if (y <= 0) dy = -dy;

        // Detect collision with paddle
        if (y + BALL_SIZE >= PADDLE_Y && x + BALL_SIZE / 2 >= paddlePosRef.current && x + BALL_SIZE / 2 <= paddlePosRef.current + PADDLE_WIDTH) {
          dy = -dy;
          setScore(score + 1);
        }

        // Detect game over
        if (y + BALL_SIZE > height) {
          setGameOver(true);
          return { x: width / 2 - BALL_SIZE / 2, y: height / 2 - BALL_SIZE / 2 };
        }

        setBallDir({ x: dx, y: dy });
        return { x, y };
      });
    }, 16);

    return () => clearInterval(interval);
  }, [gameOver, score]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        const newX = Math.min(Math.max(0, gestureState.moveX - PADDLE_WIDTH / 2), width - PADDLE_WIDTH);
        setPaddlePos(newX);
      },
    })
  ).current;

  const resetGame = () => {
    setScore(0);
    setBallPos({ x: width / 2 - BALL_SIZE / 2, y: height / 2 - BALL_SIZE / 2 });
    setBallDir({ x: 4, y: 4 });
    setGameOver(false);
  };

  return (
    <View style={styles.container}>
      <View
        style={[styles.ball, { left: ballPos.x, top: ballPos.y }]}
      />
      <View
        style={[styles.paddle, { left: paddlePos }]} 
        {...panResponder.panHandlers}
      />
      <Text style={styles.score}>Score: {score}</Text>
      {gameOver && <Text style={styles.gameOver} onPress={resetGame}>Game Over! Tap to restart</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ball: {
    position: 'absolute',
    width: BALL_SIZE,
    height: BALL_SIZE,
    backgroundColor: '#fff',
    borderRadius: BALL_SIZE / 2,
  },
  paddle: {
    position: 'absolute',
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    backgroundColor: '#fff',
    bottom: 50,
  },
  score: {
    position: 'absolute',
    top: 40,
    left: 20,
    color: '#fff',
    fontSize: 24,
  },
  gameOver: {
    position: 'absolute',
    top: height / 2 - 20,
    color: '#fff',
    fontSize: 24,
    textAlign: 'center',
  },
});