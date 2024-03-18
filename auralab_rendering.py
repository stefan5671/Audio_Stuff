import wavio
import os

def split_wav_channels(input_file, amplification):
    # Read the multi-channel WAV file
    wav_data = wavio.read(input_file)
    
    # Extract the file name without extension
    base_name = os.path.splitext(input_file)[0]
    
    # Split channels and save each one as a new WAV file
    for i in range(wav_data.data.shape[1]):
        single_channel_data = wav_data.data[:, i].reshape(-1, 1)
        output_file = f"{base_name}_{amplification}-{i+1}.wav"
        wavio.write(output_file, single_channel_data, wav_data.rate, sampwidth=wav_data.sampwidth)

if __name__ == "__main__":
    input_wav_file = r"C:\Users\stefa\Documents\Audio_Proejct\output_audio\Auralab_Renderings\Orca_Clicks\Orca_Party.wav"  # Replace with your 23-channel WAV file path
    amplification_term = 3  # Replace with your desired amplification term
    split_wav_channels(input_wav_file, amplification_term)
