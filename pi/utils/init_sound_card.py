from smbus2 import SMBus
import os
import time
import subprocess


class tasTest:
    devAddr = 0x2F
    bus = ""

    commandReturn = ""

    def __init__(self):
        self.bus = SMBus(1)

    def dumpData(self):
        commandSend = "/usr/sbin/i2cdump -y 1 " + str(self.devAddr) + " W"
        self.commandReturn = os.popen(commandSend).read()
        self.checkErrors()

    def checkErrors(self):
        # register 0x37
        fsMon = self.commandReturn.splitlines()[4][25:27]
        fsMonBin = "{0:08b}".format(int(fsMon, 16))
        fsMonStr = [
            "FS Error",
            "",
            "",
            "",
            "",
            "",
            "32KHz",
            "",
            "Reserved",
            "48KHz",
            "",
            "96KHz",
        ]
        # print("FS_MON: %s (0x37)" % (fsMon))
        # print("FS_MON: %s   (reg: 0x37)" % fsMonStr[int(fsMon)])

        # (reg: 0x70)
        errorString = self.commandReturn.splitlines()[8][4:6]
        errorStringBin = "{0:08b}".format(int(errorString, 16))
        if errorStringBin[-4] == "1":
            print("Left channel DC fault")
        if errorStringBin[-3] == "1":
            print("Right channel DC fault")
        if errorStringBin[-2] == "1":
            print("Left channel over current fault")
        if errorStringBin[-1] == "1":
            print("Right channel over current fault")

        # (reg: 0x71)
        errorString = self.commandReturn.splitlines()[8][7:9]
        errorStringBin = "{0:08b}".format(int(errorString, 16))
        """
        if errorStringBin[-3] == "1":
            print("Clock fault (reg: 0x71)")
        """

        # register 0x68
        runStatus = self.commandReturn.splitlines()[7][29:31]
        runStatusBin = "{0:08b}".format(int(runStatus, 16))
        # print(runStatus)
        runStatusStr = ["Deep sleep", "Sleep", "HIZ", "Play"]
        #print("Run Status: %s   (reg: 0x68)" % runStatusStr[int(runStatus)])

    def writeData(self, addr, val, comment=""):
        self.bus.write_byte_data(self.devAddr, addr, val)
        # print("write: %s: %s - %s" %(hex(addr),hex(val), comment ) )
        time.sleep(0.1)

    def close(self):
        self.bus.close()

    def startSequence(self):
        self.writeData(0x01, 0x11, "Reset Chip")  # reset chip
        self.writeData(0x78, 0x80, "Clear Faults")  # clear fault - works
        self.dumpData()
        self.writeData(0x01, 0x00, "Remove Reset")  # remove reset
        self.writeData(0x78, 0x00, "Remove Clear Fault")  # remove clear fault
        self.dumpData()
        self.writeData(0x33, 0x03, "32-bit")
        self.dumpData()
        self.setVolume(0x60)
        self.writeData(0x30, 0x01, "SDOUT is the DSP input (pre-processing)")

        self.writeData(0x03, 0x00, "Deep Sleep")  # Deep Sleep
        self.dumpData()

        self.writeData(0x03, 0x02, "HiZ")  # HiZ
        self.dumpData()

        self.writeData(
            0x5C, 0x01, "coefficient"
        )  # Indicate the first coefficient of a BQ is starting to write
        self.dumpData()
        self.writeData(0x03, 0x03, "Play")  # Play
        self.dumpData()

    def setVolume(self, vol):
        setVolStr = "Set Volume %s" % (str(vol))
        self.writeData(0x4C, vol, setVolStr)  # Set volume


if __name__ == "__main__":
    tt = tasTest()
    tt.startSequence()
    tt.setVolume(380)
    tt.close()

