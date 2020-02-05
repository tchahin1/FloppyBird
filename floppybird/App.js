import React, { Component } from 'react';
import { Dimensions, StyleSheet, Text, View, StatusBar, Alert, TouchableOpacity, Image, AsyncStorage } from 'react-native';
import Matter from "matter-js";
import { GameEngine } from "react-native-game-engine";
import Bird from './Bird';
import Floor from './Floor';
import Physics, { resetPipes } from './Physics';
import Constants from './Constants';
import Images from './assets/Images';
//import Sound from 'react-native-sound';

let world = null;
let highscore;

export default class App extends Component {
    constructor(props){
        super(props);

        this.state = {
            running: false,
            score: 0,
            gameOver: false,
            startingScreen: true,
        };

        this.gameEngine = null;

        this.entities = null;

        AsyncStorage.getItem('flappybirdhighestscore', (err, res) => {highscore = res;});
    }
    
    componentDidMount() {
        setTimeout(() => { this.setState({startingScreen: false}); }, 5000);
    }

    setupWorld = () => {
        if(highscore === null) highscore = 0;

        let engine = Matter.Engine.create({ enableSleeping: false });
        world = engine.world;
        world.gravity.y = 0.0;

        let bird = Matter.Bodies.rectangle( Constants.MAX_WIDTH / 2, Constants.MAX_HEIGHT / 2, Constants.BIRD_WIDTH, Constants.BIRD_HEIGHT - 20);

        let floor1 = Matter.Bodies.rectangle(
            Constants.MAX_WIDTH / 2,
            Constants.MAX_HEIGHT - 25,
            Constants.MAX_WIDTH + 4,
            50,
            { isStatic: true }
        );

        let floor2 = Matter.Bodies.rectangle(
            Constants.MAX_WIDTH + (Constants.MAX_WIDTH / 2),
            Constants.MAX_HEIGHT - 25,
            Constants.MAX_WIDTH + 4,
            50,
            { isStatic: true }
        );

        let ceiling = Matter.Bodies.rectangle(
          Constants.MAX_WIDTH / 2,
          0,
          Constants.MAX_WIDTH,
          1,
          { isStatic: true }
      );

        Matter.World.add(world, [bird, floor1, floor2, ceiling]);
        Matter.Events.on(engine, 'collisionStart', (event) => {
            var pairs = event.pairs;

            this.gameEngine.dispatch({ type: "game-over"});

        });

        return {
            physics: { engine: engine, world: world },
            floor1: { body: floor1, renderer: Floor },
            floor2: { body: floor2, renderer: Floor },
            bird: { body: bird, pose: 1, renderer: Bird },
            ceiling: { body: ceiling, render: Floor }
        }
    }

    onEvent = (e) => {
        if (e.type === "game-over") {
            this.setState({
                gameOver: true,
                running: false
            });
        } else if (e.type === "score") {
            this.setState({
                score: this.state.score + 1
            })
        }
    }

    //I NEED TO FIX THE HIGH SCORE OPTION!!!!!!!!!

    endGame = () => {
      this.setState({
        gameOver: false
      }); 
      if(highscore !== null && highscore !== undefined) {
        if(this.state.score > Number(highscore)) {
          AsyncStorage.setItem('flappybirdhighestscore', this.state.score.toString());
          highscore = this.state.score;
        }
      }
    }

    reset = () => {
        resetPipes();
        if(this.gameEngine !== null) this.gameEngine.swap(this.setupWorld());
        else this.entities = this.setupWorld();
        this.setState({
            running: true,
            score: 0
        });
    }

    render() {

        if(this.state.startingScreen) return (
            <View style={styles.fullScreen}>
                <Text style={styles.titleSubText}>ANKORA INC.</Text>
                <Text style={styles.titleSubText2}>PRESENTS</Text>
                <Text style={styles.titleText}>FLOPPY</Text>
                <Text style={styles.titleText2}>BIRD</Text>
                <Text style={styles.titleVersionText}>v 1.0</Text>
            </View>
        )
        else return (
            (!this.state.gameOver && !this.state.running && !this.state.startingScreen ? <TouchableOpacity style={styles.fullScreenButton} onPress={this.reset}>
                    <Image source={Images.background} style={styles.backgroundImage} resizeMode="stretch" />
                    <View style={styles.fullScreen}>
                        {highscore !== null ? <Text style={styles.highscoreText}>HIGHEST SCORE:</Text> : null}
                        {highscore !== null ? <Text style={styles.highscore}>{`${highscore}`}</Text> : null}
                        <Text style={styles.gameOverText}>Play</Text>
                    </View>
              </TouchableOpacity> :
            <View style={styles.container}>
                <Image source={Images.background} style={styles.backgroundImage} resizeMode="stretch" />
                <GameEngine
                    ref={(ref) => { this.gameEngine = ref; }}
                    style={styles.gameContainer}
                    systems={[Physics]}
                    running={this.state.running}
                    onEvent={this.onEvent}
                    entities={this.entities}>
                    <StatusBar hidden={true} />
                </GameEngine>
                <Text style={styles.score}>{this.state.score}</Text>
                {this.state.gameOver && <TouchableOpacity style={styles.fullScreenButton} onPress={this.endGame}>
                    <View style={styles.fullScreen}>
                        <Text style={styles.gameOverText}>Game Over</Text>
                        <Text style={styles.gameOverSubText}>Try Again</Text>
                    </View>
                </TouchableOpacity>}
            </View>)
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    backgroundImage: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        width: Constants.MAX_WIDTH,
        height: Constants.MAX_HEIGHT
    },
    gameContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    },
    highscoreText: {
      color: 'white',
      fontSize: 18,
      fontFamily: '04b',
      marginTop: -200
    },
    highscore: {
      color: 'white',
      fontSize: 24,
      fontFamily: '04b',
      marginBottom: 100,
      marginTop: 10
    },
    titleSubText: {
        color: 'white',
        fontSize: 30,
        fontFamily: '04b',
        marginTop: -100
    },
    titleSubText2: {
        color: 'white',
        fontSize: 20,
        fontFamily: '04b',
        marginBottom: 80,
    },
    titleText: {
        color: 'white',
        fontSize: 70,
        fontFamily: '04b'
    },
    titleText2: {
        color: 'white',
        fontSize: 60,
        fontFamily: '04b'
    },
    titleVersionText: {
        color: 'white',
        fontSize: 30,
        transform: [{ rotate: '-25deg'}],
        marginTop: -20,
        marginLeft: 200
    },
    gameOverText: {
        color: 'white',
        fontSize: 48,
        fontFamily: '04b'
    },
    gameOverSubText: {
        color: 'white',
        fontSize: 24,
        fontFamily: '04b'
    },
    fullScreen: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    score: {
        position: 'absolute',
        color: 'white',
        fontSize: 72,
        top: 50,
        left: Constants.MAX_WIDTH / 2 - 20,
        textShadowColor: '#444444',
        textShadowOffset: { width: 2, height: 2},
        textShadowRadius: 2,
        fontFamily: '04b'
    },
    fullScreenButton: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        flex: 1
    }
});
