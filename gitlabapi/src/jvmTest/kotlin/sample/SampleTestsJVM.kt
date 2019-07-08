package sample

import kotlin.test.Test
import kotlin.test.assertTrue

class SampleTestsJVM {

    @Test fun testHello() {
        assertTrue("JVM" in hello())
    }

    @Test fun testCommonHello() {
        assertTrue("Hello Commoners" in commonHello())
    }
}
